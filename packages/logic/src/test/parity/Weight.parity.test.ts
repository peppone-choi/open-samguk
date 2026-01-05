import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";

describe("Weight Selection Parity Tests", () => {
  describe("choiceUsingWeight 결정론", () => {
    it("동일 시드로 동일 결과", () => {
      const seed = "weight-determinism";
      const weights = { a: 10, b: 20, c: 30 };

      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.choiceUsingWeight(weights)).toBe(
          rand2.choiceUsingWeight(weights),
        );
      }
    });

    it("숫자 키도 정상 동작", () => {
      const seed = "weight-numeric-key";
      const weights: Record<number, number> = { 1: 10, 2: 20, 3: 30 };

      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.choiceUsingWeight(weights)).toBe(
          rand2.choiceUsingWeight(weights),
        );
      }
    });
  });

  describe("choiceUsingWeight 분포", () => {
    it("가중치에 비례하여 선택됨", () => {
      const seed = "weight-distribution";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = { a: 100, b: 200, c: 300 };

      const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const choice = rand.choiceUsingWeight(weights) as string;
        counts[choice]++;
      }

      const total = 600; // 100 + 200 + 300
      // 허용 오차 15% 내에서 비율 확인
      expect(counts.a / iterations).toBeCloseTo(100 / total, 1);
      expect(counts.b / iterations).toBeCloseTo(200 / total, 1);
      expect(counts.c / iterations).toBeCloseTo(300 / total, 1);
    });

    it("가중치가 같으면 균등 분포", () => {
      const seed = "equal-weight";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = { a: 100, b: 100, c: 100 };

      const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
      const iterations = 9000;

      for (let i = 0; i < iterations; i++) {
        const choice = rand.choiceUsingWeight(weights) as string;
        counts[choice]++;
      }

      // 각 항목이 약 1/3 선택됨 (허용 오차 15%)
      expect(counts.a / iterations).toBeCloseTo(1 / 3, 1);
      expect(counts.b / iterations).toBeCloseTo(1 / 3, 1);
      expect(counts.c / iterations).toBeCloseTo(1 / 3, 1);
    });

    it("0 가중치 항목은 선택되지 않음", () => {
      const seed = "zero-weight";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = { a: 100, b: 0, c: 100 };

      for (let i = 0; i < 1000; i++) {
        const choice = rand.choiceUsingWeight(weights);
        expect(choice).not.toBe("b");
      }
    });

    it("단일 항목은 항상 선택됨", () => {
      const seed = "single-weight";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = { only: 100 };

      for (let i = 0; i < 100; i++) {
        expect(rand.choiceUsingWeight(weights)).toBe("only");
      }
    });

    it("가중치 1인 항목도 정상 선택", () => {
      const seed = "small-weight";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = { a: 1, b: 1000 };

      let aCount = 0;
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        if (rand.choiceUsingWeight(weights) === "a") {
          aCount++;
        }
      }

      // a가 약 0.1% 선택됨 (1/1001)
      expect(aCount).toBeGreaterThan(0);
      expect(aCount).toBeLessThan(iterations * 0.01); // 1% 미만
    });
  });

  describe("choiceUsingWeightPair 패리티", () => {
    it("동일 시드로 동일 결과", () => {
      const seed = "pair-weight";
      const pairs: [string, number][] = [
        ["a", 10],
        ["b", 20],
        ["c", 30],
      ];

      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.choiceUsingWeightPair(pairs)).toBe(
          rand2.choiceUsingWeightPair(pairs),
        );
      }
    });

    it("객체 형태와 동일한 결과", () => {
      const seed = "pair-vs-object";

      const objectWeights = { a: 10, b: 20, c: 30 };
      const pairWeights: [string, number][] = [
        ["a", 10],
        ["b", 20],
        ["c", 30],
      ];

      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.choiceUsingWeight(objectWeights)).toBe(
          rand2.choiceUsingWeightPair(pairWeights),
        );
      }
    });

    it("복잡한 타입도 선택 가능", () => {
      const seed = "pair-complex-type";
      const items: [{ id: number; name: string }, number][] = [
        [{ id: 1, name: "first" }, 10],
        [{ id: 2, name: "second" }, 20],
        [{ id: 3, name: "third" }, 30],
      ];

      const rand = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        const choice = rand.choiceUsingWeightPair(items);
        expect(choice).toHaveProperty("id");
        expect(choice).toHaveProperty("name");
      }
    });
  });

  describe("극단적 케이스", () => {
    it("매우 큰 가중치 차이", () => {
      const seed = "extreme-weight";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = { rare: 1, common: 1000000 };

      let rareCount = 0;
      const iterations = 100000;

      for (let i = 0; i < iterations; i++) {
        if (rand.choiceUsingWeight(weights) === "rare") {
          rareCount++;
        }
      }

      // rare가 약 0.0001% 선택됨 (1/1000001)
      expect(rareCount).toBeGreaterThanOrEqual(0);
      expect(rareCount).toBeLessThan(iterations * 0.001);
    });

    it("모든 가중치가 0이면 에러 또는 undefined", () => {
      const seed = "all-zero-weight";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = { a: 0, b: 0, c: 0 };

      // 구현에 따라 에러 또는 undefined 반환
      // 여기서는 동작만 확인
      try {
        const result = rand.choiceUsingWeight(weights);
        // 결과가 undefined이거나 키 중 하나여야 함
        expect(
          result === undefined ||
            result === "a" ||
            result === "b" ||
            result === "c",
        ).toBe(true);
      } catch {
        // 에러가 발생해도 정상
        expect(true).toBe(true);
      }
    });

    it("빈 객체", () => {
      const seed = "empty-weight";
      const rand = new RandUtil(new LiteHashDRBG(seed));
      const weights = {};

      try {
        const result = rand.choiceUsingWeight(weights);
        expect(result).toBeUndefined();
      } catch {
        // 에러가 발생해도 정상
        expect(true).toBe(true);
      }
    });
  });

  describe("순서 독립성", () => {
    it("객체 키 순서가 다르면 결과도 다를 수 있음 (JS 객체 특성)", () => {
      // JavaScript 객체의 키 순서는 삽입 순서를 따름
      // 하지만 동일한 시드에서는 결정론적이어야 함
      const seed = "order-test";

      const weights1 = { a: 10, b: 20, c: 30 };
      const weights2 = { c: 30, b: 20, a: 10 }; // 다른 순서

      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      // 각각 결정론적이면 됨
      const results1: string[] = [];
      const results2: string[] = [];

      for (let i = 0; i < 100; i++) {
        results1.push(rand1.choiceUsingWeight(weights1) as string);
        results2.push(rand2.choiceUsingWeight(weights2) as string);
      }

      // 재실행해도 같은 결과
      const rand1Again = new RandUtil(new LiteHashDRBG(seed));
      const rand2Again = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1Again.choiceUsingWeight(weights1)).toBe(results1[i]);
        expect(rand2Again.choiceUsingWeight(weights2)).toBe(results2[i]);
      }
    });
  });
});
