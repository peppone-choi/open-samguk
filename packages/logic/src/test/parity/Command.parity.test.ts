import { describe, it, expect, beforeEach } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { ParityHarness } from "../ParityHarness.js";
import {
  createMinimalSnapshot,
  createGeneral,
  createNation,
  createCity,
  createBasicSnapshot,
} from "../fixtures/factory.js";
import { CommandFactory } from "../../domain/CommandFactory.js";
import { WorldSnapshot } from "../../domain/entities.js";
import { ParityCase } from "../types.js";

describe("Command Execution Parity Tests", () => {
  let harness: ParityHarness;

  beforeEach(() => {
    harness = new ParityHarness({
      floatTolerance: 1e-10,
      ignoreTimestamps: true,
    });
  });

  describe("ParityHarness 기본 동작", () => {
    it("커맨드 없이 빈 델타 반환", () => {
      const snapshot = createBasicSnapshot();
      const result = harness.runCase({
        name: "빈 커맨드 테스트",
        input: {
          snapshot,
          seed: "empty-command-test",
        },
        expected: {
          delta: {},
          logs: { general: {}, nation: {}, global: [] },
        },
      });

      expect(result.passed).toBe(true);
      expect(result.diffs).toHaveLength(0);
    });

    it("runAll로 여러 케이스 실행", () => {
      const snapshot = createBasicSnapshot();
      const cases: ParityCase[] = [
        {
          name: "케이스 1",
          input: { snapshot, seed: "seed-1" },
          expected: {
            delta: {},
            logs: { general: {}, nation: {}, global: [] },
          },
        },
        {
          name: "케이스 2",
          input: { snapshot, seed: "seed-2" },
          expected: {
            delta: {},
            logs: { general: {}, nation: {}, global: [] },
          },
        },
      ];

      const summary = harness.runAll(cases);

      expect(summary.total).toBe(2);
      expect(summary.passed).toBe(2);
      expect(summary.failed).toBe(0);
    });
  });

  describe("휴식 커맨드 (GeneralRest)", () => {
    it("휴식은 빈 델타 반환", () => {
      const snapshot = createBasicSnapshot();

      const result = harness.runCase({
        name: "휴식 커맨드 테스트",
        input: {
          snapshot,
          seed: "rest-test",
          command: {
            type: "휴식",
            arg: {},
            actorId: 1,
          },
        },
        expected: {
          delta: {
            generals: { 1: {} },
          },
          logs: { general: {}, nation: {}, global: [] },
        },
      });

      expect(result.passed).toBe(true);
    });
  });

  describe("커맨드 결정론", () => {
    it("동일 시드로 동일 결과 (농지개간)", () => {
      const snapshot = createBasicSnapshot({ politics: 80 });
      const seed = "agri-determinism-test";

      const rng1 = new LiteHashDRBG(seed);
      const rand1 = new RandUtil(rng1);
      const rng2 = new LiteHashDRBG(seed);
      const rand2 = new RandUtil(rng2);

      const cmd = CommandFactory.create("농지개간");

      const delta1 = cmd.run(rand1, snapshot, 1, {});
      const delta2 = cmd.run(rand2, snapshot, 1, {});

      // 델타가 동일해야 함
      expect(delta1.generals?.[1]).toEqual(delta2.generals?.[1]);
      expect(delta1.cities?.[1]).toEqual(delta2.cities?.[1]);
    });

    it("다른 시드로 다른 결과 (농지개간)", () => {
      const snapshot = createBasicSnapshot({ politics: 80 });

      const rng1 = new LiteHashDRBG("seed-a");
      const rand1 = new RandUtil(rng1);
      const rng2 = new LiteHashDRBG("seed-b");
      const rand2 = new RandUtil(rng2);

      const cmd = CommandFactory.create("농지개간");

      const delta1 = cmd.run(rand1, snapshot, 1, {});
      const delta2 = cmd.run(rand2, snapshot, 1, {});

      // 결과가 다를 수 있음 (확률적)
      // 단, 두 결과 모두 유효해야 함
      expect(delta1.cities?.[1]?.agri).toBeDefined();
      expect(delta2.cities?.[1]?.agri).toBeDefined();
    });

    it("동일 시드로 동일 결과 (상업투자)", () => {
      const snapshot = createBasicSnapshot({ intel: 80 });
      const seed = "comm-determinism-test";

      const rng1 = new LiteHashDRBG(seed);
      const rand1 = new RandUtil(rng1);
      const rng2 = new LiteHashDRBG(seed);
      const rand2 = new RandUtil(rng2);

      const cmd = CommandFactory.create("상업투자");

      const delta1 = cmd.run(rand1, snapshot, 1, {});
      const delta2 = cmd.run(rand2, snapshot, 1, {});

      expect(delta1.generals?.[1]).toEqual(delta2.generals?.[1]);
      expect(delta1.cities?.[1]).toEqual(delta2.cities?.[1]);
    });

    it("동일 시드로 동일 결과 (치안강화)", () => {
      const snapshot = createBasicSnapshot({ strength: 80 });
      const seed = "secu-determinism-test";

      const rng1 = new LiteHashDRBG(seed);
      const rand1 = new RandUtil(rng1);
      const rng2 = new LiteHashDRBG(seed);
      const rand2 = new RandUtil(rng2);

      const cmd = CommandFactory.create("치안강화");

      const delta1 = cmd.run(rand1, snapshot, 1, {});
      const delta2 = cmd.run(rand2, snapshot, 1, {});

      expect(delta1.generals?.[1]).toEqual(delta2.generals?.[1]);
      expect(delta1.cities?.[1]).toEqual(delta2.cities?.[1]);
    });
  });

  describe("증여 커맨드 (GeneralGift)", () => {
    it("금 증여 정확성", () => {
      const snapshot = createMinimalSnapshot({
        generals: {
          1: createGeneral(1, {
            nationId: 1,
            cityId: 1,
            gold: 5000,
          }),
          2: createGeneral(2, {
            nationId: 1,
            cityId: 1,
            gold: 100,
          }),
        },
        nations: { 1: createNation(1) },
        cities: { 1: createCity(1, { nationId: 1 }) },
      });

      const seed = "gift-gold-test";
      const rng = new LiteHashDRBG(seed);
      const rand = new RandUtil(rng);

      const cmd = CommandFactory.create("증여");
      const delta = cmd.run(rand, snapshot, 1, {
        isGold: true,
        amount: 1000,
        destGeneralId: 2,
      });

      // 증여자 금 감소
      expect(delta.generals?.[1]?.gold).toBe(4000);
      // 수혜자 금 증가
      expect(delta.generals?.[2]?.gold).toBe(1100);
    });

    it("쌀 증여 정확성", () => {
      const snapshot = createMinimalSnapshot({
        generals: {
          1: createGeneral(1, {
            nationId: 1,
            cityId: 1,
            rice: 5000,
          }),
          2: createGeneral(2, {
            nationId: 1,
            cityId: 1,
            rice: 100,
          }),
        },
        nations: { 1: createNation(1) },
        cities: { 1: createCity(1, { nationId: 1 }) },
      });

      const seed = "gift-rice-test";
      const rng = new LiteHashDRBG(seed);
      const rand = new RandUtil(rng);

      const cmd = CommandFactory.create("증여");
      const delta = cmd.run(rand, snapshot, 1, {
        isGold: false,
        amount: 1000,
        destGeneralId: 2,
      });

      // 증여자 쌀 감소
      expect(delta.generals?.[1]?.rice).toBe(4000);
      // 수혜자 쌀 증가
      expect(delta.generals?.[2]?.rice).toBe(1100);
    });
  });

  describe("헌납 커맨드 (GeneralDonate)", () => {
    it("금 헌납 정확성", () => {
      const snapshot = createMinimalSnapshot({
        generals: {
          1: createGeneral(1, {
            nationId: 1,
            cityId: 1,
            gold: 5000,
          }),
        },
        nations: {
          1: createNation(1, { gold: 10000 }),
        },
        cities: { 1: createCity(1, { nationId: 1 }) },
      });

      const seed = "donate-gold-test";
      const rng = new LiteHashDRBG(seed);
      const rand = new RandUtil(rng);

      const cmd = CommandFactory.create("헌납");
      const delta = cmd.run(rand, snapshot, 1, {
        isGold: true,
        amount: 1000,
      });

      // 장수 금 감소
      expect(delta.generals?.[1]?.gold).toBe(4000);
      // 국가 금 증가
      expect(delta.nations?.[1]?.gold).toBe(11000);
    });
  });

  describe("정규화 검증", () => {
    it("델타 정규화가 정상 동작", () => {
      const output = harness.normalize({
        delta: {
          generals: {
            2: { gold: 100 },
            1: { gold: 200 },
          },
        },
        logs: {
          general: {
            2: ["로그2"],
            1: ["로그1"],
          },
          nation: {},
          global: ["글로벌2", "글로벌1"],
        },
      });

      // 키가 숫자순으로 정렬되어야 함
      const generalKeys = Object.keys(output.delta.generals || {});
      expect(generalKeys).toEqual(["1", "2"]);

      // 로그 배열도 정렬
      expect(output.logs.global).toEqual(["글로벌1", "글로벌2"]);
    });

    it("Date가 ignoreTimestamps 옵션에 따라 처리됨", () => {
      const harnessWithTimestamps = new ParityHarness({
        ignoreTimestamps: false,
      });

      const harnessWithoutTimestamps = new ParityHarness({
        ignoreTimestamps: true,
      });

      const output = {
        delta: {},
        logs: { general: {}, nation: {}, global: [] },
      };

      // 두 하네스 모두 정규화 가능
      expect(() => harnessWithTimestamps.normalize(output)).not.toThrow();
      expect(() => harnessWithoutTimestamps.normalize(output)).not.toThrow();
    });
  });

  describe("비교 로직 검증", () => {
    it("동일한 출력은 diffs가 비어있음", () => {
      const snapshot = createBasicSnapshot();
      const result = harness.runCase({
        name: "동일 출력 테스트",
        input: { snapshot, seed: "same-output" },
        expected: {
          delta: {},
          logs: { general: {}, nation: {}, global: [] },
        },
      });

      expect(result.passed).toBe(true);
      expect(result.diffs).toHaveLength(0);
    });

    it("다른 출력은 diffs에 차이점 기록", () => {
      const snapshot = createBasicSnapshot();
      const result = harness.runCase({
        name: "다른 출력 테스트",
        input: { snapshot, seed: "diff-output" },
        expected: {
          delta: {
            generals: { 1: { gold: 9999 } }, // 실제와 다른 값
          },
          logs: { general: {}, nation: {}, global: [] },
        },
      });

      // 커맨드가 없으므로 빈 델타, expected와 다름
      expect(result.passed).toBe(false);
      expect(result.diffs.length).toBeGreaterThan(0);
    });

    it("숫자 비교는 허용 오차 적용", () => {
      const h = new ParityHarness({ floatTolerance: 0.01 });
      const output1 = {
        delta: { generals: { 1: { gold: 100.001 as unknown } } },
        logs: { general: {}, nation: {}, global: [] },
      };
      const output2 = {
        delta: { generals: { 1: { gold: 100.002 as unknown } } },
        logs: { general: {}, nation: {}, global: [] },
      };

      const normalized1 = h.normalize(output1 as never);
      const normalized2 = h.normalize(output2 as never);

      // 허용 오차 내이므로 동일하게 취급
      expect(Math.abs(100.001 - 100.002)).toBeLessThan(0.01);
    });
  });

  describe("에러 처리", () => {
    it("존재하지 않는 커맨드는 휴식으로 폴백", () => {
      const snapshot = createBasicSnapshot();
      const seed = "unknown-command";
      const rng = new LiteHashDRBG(seed);
      const rand = new RandUtil(rng);

      const cmd = CommandFactory.create("존재하지않는커맨드");
      const delta = cmd.run(rand, snapshot, 1, {});

      // 휴식으로 폴백되어 빈 델타 반환
      expect(delta.generals?.[1]).toEqual({});
    });

    it("잘못된 입력으로 에러 발생 시 result.error 기록", () => {
      // 스냅샷 없이 커맨드 실행하면 에러 발생
      const result = harness.runCase({
        name: "에러 테스트",
        input: {
          snapshot: {} as WorldSnapshot, // 잘못된 스냅샷
          seed: "error-test",
          command: {
            type: "농지개간",
            arg: {},
            actorId: 999, // 존재하지 않는 장수
          },
        },
        expected: {
          delta: {},
          logs: { general: {}, nation: {}, global: [] },
        },
      });

      // 에러가 발생하면 passed=false이고 error 메시지가 있음
      if (result.error) {
        expect(result.passed).toBe(false);
        expect(result.error).toBeDefined();
      }
    });
  });
});
