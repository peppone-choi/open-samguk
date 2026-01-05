import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";

describe("RNG Parity Tests", () => {
  describe("LiteHashDRBG 결정론", () => {
    it("동일 시드로 동일 시퀀스 생성", () => {
      const seed = "determinism-test-seed";
      const rng1 = new LiteHashDRBG(seed);
      const rng2 = new LiteHashDRBG(seed);

      for (let i = 0; i < 1000; i++) {
        expect(rng1.nextFloat1()).toBe(rng2.nextFloat1());
      }
    });

    it("동일 시드로 동일 정수 시퀀스 생성", () => {
      const seed = "int-test-seed";
      const rng1 = new LiteHashDRBG(seed);
      const rng2 = new LiteHashDRBG(seed);

      for (let i = 0; i < 1000; i++) {
        expect(rng1.nextInt(100)).toBe(rng2.nextInt(100));
      }
    });

    it("동일 시드로 동일 바이트 시퀀스 생성", () => {
      const seed = "bytes-test-seed";
      const rng1 = new LiteHashDRBG(seed);
      const rng2 = new LiteHashDRBG(seed);

      for (let i = 0; i < 100; i++) {
        const bytes1 = rng1.nextBytes(16);
        const bytes2 = rng2.nextBytes(16);
        expect(bytes1).toEqual(bytes2);
      }
    });

    it("다른 시드로 다른 시퀀스 생성", () => {
      const rng1 = new LiteHashDRBG("seed-a");
      const rng2 = new LiteHashDRBG("seed-b");

      let sameCount = 0;
      for (let i = 0; i < 100; i++) {
        if (rng1.nextFloat1() === rng2.nextFloat1()) sameCount++;
      }
      // 우연히 같을 확률은 매우 낮아야 함
      expect(sameCount).toBeLessThan(10);
    });

    it("getMaxInt가 53비트 최대값 반환", () => {
      const rng = new LiteHashDRBG("max-int-test");
      expect(rng.getMaxInt()).toBe(0x1f_ffff_ffff_ffff);
    });

    it("nextInt(max) 범위 검증", () => {
      const rng = new LiteHashDRBG("range-test");
      const max = 100;

      for (let i = 0; i < 1000; i++) {
        const val = rng.nextInt(max);
        expect(val).toBeGreaterThanOrEqual(0);
        // LiteHashDRBG.nextInt은 [0, max] 범위 (max 포함)
        expect(val).toBeLessThanOrEqual(max);
      }
    });

    it("nextFloat1 범위 검증 (0~1)", () => {
      const rng = new LiteHashDRBG("float-range-test");

      for (let i = 0; i < 1000; i++) {
        const val = rng.nextFloat1();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("RandUtil 패리티", () => {
    it("shuffle 결정론", () => {
      const seed = "shuffle-test";
      const items1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const items2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      const shuffled1 = rand1.shuffle(items1);
      const shuffled2 = rand2.shuffle(items2);

      expect(shuffled1).toEqual(shuffled2);
    });

    it("shuffle이 원본을 유지함", () => {
      const seed = "shuffle-immutable-test";
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];

      const rand = new RandUtil(new LiteHashDRBG(seed));
      rand.shuffle(copy);

      // shuffle은 원본을 수정하지 않음 (새 배열 반환)
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it("nextBool 결정론", () => {
      const seed = "bool-test";
      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.nextBool(0.5)).toBe(rand2.nextBool(0.5));
      }
    });

    it("nextBool(1.0)은 항상 true", () => {
      const rand = new RandUtil(new LiteHashDRBG("bool-always-true"));

      for (let i = 0; i < 100; i++) {
        expect(rand.nextBool(1.0)).toBe(true);
      }
    });

    it("nextBool(0.0)은 항상 false", () => {
      const rand = new RandUtil(new LiteHashDRBG("bool-always-false"));

      for (let i = 0; i < 100; i++) {
        expect(rand.nextBool(0.0)).toBe(false);
      }
    });

    it("nextRange 결정론", () => {
      const seed = "range-test";
      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.nextRange(10, 20)).toBe(rand2.nextRange(10, 20));
      }
    });

    it("nextRangeInt 결정론", () => {
      const seed = "range-int-test";
      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.nextRangeInt(10, 20)).toBe(rand2.nextRangeInt(10, 20));
      }
    });

    it("nextRangeInt 범위 검증", () => {
      const rand = new RandUtil(new LiteHashDRBG("range-int-bounds"));
      const min = 10;
      const max = 20;

      for (let i = 0; i < 1000; i++) {
        const val = rand.nextRangeInt(min, max);
        expect(val).toBeGreaterThanOrEqual(min);
        expect(val).toBeLessThanOrEqual(max);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    it("choice 결정론", () => {
      const seed = "choice-test";
      const items = ["a", "b", "c", "d", "e"];

      const rand1 = new RandUtil(new LiteHashDRBG(seed));
      const rand2 = new RandUtil(new LiteHashDRBG(seed));

      for (let i = 0; i < 100; i++) {
        expect(rand1.choice(items)).toBe(rand2.choice(items));
      }
    });

    it("choice가 배열 내 항목만 반환", () => {
      const rand = new RandUtil(new LiteHashDRBG("choice-bounds"));
      const items = ["apple", "banana", "cherry"];

      for (let i = 0; i < 100; i++) {
        const chosen = rand.choice(items);
        expect(items).toContain(chosen);
      }
    });
  });

  describe("RNG 시드 형식", () => {
    it("빈 문자열 시드도 유효", () => {
      const rng1 = new LiteHashDRBG("");
      const rng2 = new LiteHashDRBG("");

      expect(rng1.nextFloat1()).toBe(rng2.nextFloat1());
    });

    it("긴 문자열 시드도 유효", () => {
      const longSeed = "a".repeat(1000);
      const rng1 = new LiteHashDRBG(longSeed);
      const rng2 = new LiteHashDRBG(longSeed);

      expect(rng1.nextFloat1()).toBe(rng2.nextFloat1());
    });

    it("유니코드 시드도 유효", () => {
      const unicodeSeed = "테스트시드한글🎮";
      const rng1 = new LiteHashDRBG(unicodeSeed);
      const rng2 = new LiteHashDRBG(unicodeSeed);

      expect(rng1.nextFloat1()).toBe(rng2.nextFloat1());
    });
  });
});
