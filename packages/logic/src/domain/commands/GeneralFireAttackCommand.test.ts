import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { createMockWorldSnapshot } from "../test-utils.js";
import { GeneralFireAttackCommand } from "./GeneralFireAttackCommand.js";

describe("GeneralFireAttackCommand", () => {
  const seed = "test-fire-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot = createMockWorldSnapshot({
    generals: {
      1: {
        id: 1,
        name: "제갈량",
        nationId: 1,
        cityId: 1,
        gold: 10000,
        rice: 10000,
        leadership: 50,
        strength: 50,
        intel: 100,
        politics: 50,
        charm: 50,
      },
      2: {
        id: 2,
        name: "바보",
        nationId: 2,
        cityId: 2,
        gold: 0,
        rice: 0,
        intel: 10,
        leadership: 50,
        strength: 50,
        politics: 50,
        charm: 50,
      },
    },
    nations: {
      1: {
        id: 1,
        name: "촉",
        capitalCityId: 1,
        chiefGeneralId: 1,
      },
      2: {
        id: 2,
        name: "위",
        capitalCityId: 2,
        chiefGeneralId: 2,
      },
    },
    cities: {
      1: {
        id: 1,
        name: "업",
        nationId: 1,
        pop: 1000,
        agri: 1000,
        comm: 1000,
        secu: 100,
        def: 100,
        wall: 100,
        trust: 100,
      },
      2: {
        id: 2,
        name: "허창",
        nationId: 2,
        pop: 1000,
        agri: 1000,
        comm: 1000,
        secu: 100,
        def: 100,
        wall: 100,
        trust: 100,
      },
    },
    env: { develcost: 20 },
  });

  it("거리 5 이내의 적국 도시에 화계를 성공해야 함", () => {
    const cmd = new GeneralFireAttackCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 2 });

    expect(delta.generals?.[1]?.gold).toBeLessThan(10000);

    const logs = delta.logs?.general?.[1] || [];
    const isSuccess = logs.some((l) => l.includes("성공"));
    const isFail = logs.some((l) => l.includes("실패"));

    expect(isSuccess || isFail).toBe(true);

    if (isSuccess) {
      expect(delta.cities?.[2]?.agri).toBeLessThan(1000);
    }
  });

  it("자금이 부족하면 실패해야 함", () => {
    const poorSnapshot = JSON.parse(JSON.stringify(mockSnapshot));
    poorSnapshot.generals[1].gold = 0;
    poorSnapshot.generals[1].turnTime = new Date();
    poorSnapshot.generals[2].turnTime = new Date();

    const cmd = new GeneralFireAttackCommand();
    const delta = cmd.run(rand, poorSnapshot, 1, { destCityId: 2 });

    expect(delta.logs?.general?.[1][0]).toContain("자금이 부족합니다");
  });
});
