import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "../src/index.js";

const FIXED_KEY = "HelloWorld";
const BUFFER_BYTE_SIZE = 64; // SHA-512 = 512 bits = 64 bytes

/**
 * Python TestVector:
 * import hashlib, struct
 * fixedKey = 'HelloWorld'.encode('utf-8')
 * def hash(key, idx):
 *     idxV = struct.pack("<I", idx)
 *     return hashlib.sha512(key + idxV).digest()
 * for idx in range(5):
 *     print(hash(fixedKey, idx).hex())
 */
const TEST_VECTOR = Buffer.from(
  [
    "24d9ccd648556255fd0ee9f5b29918de90617341958b3b354d572167e4dee02b757816a2bbe0b502c52413ffd384381a9d7b4e193df6f4345d6a95e111d661c4",
    "2e9264512f6f4b080cf1376b74fab6878ecf4a6e185942d2e5b22cf923885b9952d40601a414225d6901417fd4ce9368ac77e4a63d3fc9b58ab952bb8c33f165",
    "8e2ebf5af6283a1b18f4c044c86c20d02be3890613c4cc8b7c6b7b35581263b972a82630df69a9289988422d7c3a9be5edf78d5de16fabd01e5dd4e458068d8a",
    "398596047ba547bfe371ec863a3e019ab0dbc4bb3b27e9077685aae4283ff6bbccfd981d92f9358f7efffbb72a940414802d98466d132e2ad0a16a12946d5f47",
    "b3606fe9b18c4aa7315e78bb9e47cb51cc4e203fcc2e631f0405c1b872c8e1cb5b6415ea74bbb77fffaaadb002b47cb4f4628dc0709634365b187667f5c708cb",
  ].join(""),
  "hex"
);

describe("LiteHashDRBG", () => {
  describe("결정론적 출력 검증", () => {
    it("동일 seed로 동일한 바이트 시퀀스 생성", () => {
      const rng1 = new LiteHashDRBG(FIXED_KEY);
      const rng2 = new LiteHashDRBG(FIXED_KEY);

      for (let i = 0; i < 10; i++) {
        const a = rng1.nextBytes(16);
        const b = rng2.nextBytes(16);
        expect(a).toEqual(b);
      }
    });

    it("다른 seed로 다른 바이트 시퀀스 생성", () => {
      const rng1 = new LiteHashDRBG("seed1");
      const rng2 = new LiteHashDRBG("seed2");

      const a = rng1.nextBytes(16);
      const b = rng2.nextBytes(16);
      expect(a).not.toEqual(b);
    });

    it("PHP/Python 테스트 벡터와 일치", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);

      let offset = 0;
      expect(rng.nextBytes(10)).toEqual(new Uint8Array(TEST_VECTOR.slice(offset, offset + 10)));
      offset += 10;
      expect(rng.nextBytes(32)).toEqual(new Uint8Array(TEST_VECTOR.slice(offset, offset + 32)));
      offset += 32;
      expect(rng.nextBytes(1)).toEqual(new Uint8Array(TEST_VECTOR.slice(offset, offset + 1)));
      offset += 1;
      expect(rng.nextBytes(64)).toEqual(new Uint8Array(TEST_VECTOR.slice(offset, offset + 64)));
      offset += 64;
      expect(rng.nextBytes(5)).toEqual(new Uint8Array(TEST_VECTOR.slice(offset, offset + 5)));
    });
  });

  describe("nextBytes", () => {
    it("요청한 바이트 수만큼 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      expect(rng.nextBytes(1).length).toBe(1);
      expect(rng.nextBytes(10).length).toBe(10);
      expect(rng.nextBytes(64).length).toBe(64);
      expect(rng.nextBytes(100).length).toBe(100);
    });

    it("0 또는 음수 요청 시 에러", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      expect(() => rng.nextBytes(0)).toThrow();
      expect(() => rng.nextBytes(-1)).toThrow();
    });
  });

  describe("nextBits", () => {
    it("요청한 비트 수에 해당하는 바이트 배열 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);

      const bits8 = rng.nextBits(8);
      expect(bits8.length).toBe(1);

      const bits10 = rng.nextBits(10);
      expect(bits10.length).toBe(2);

      const bits53 = rng.nextBits(53);
      expect(bits53.length).toBe(7);
    });

    it("상위 비트가 마스킹됨", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);

      const bits1 = rng.nextBits(1);
      expect(bits1[0] & 0xfe).toBe(0);

      const bits3 = rng.nextBits(3);
      expect(bits3[0] & 0xf8).toBe(0);
    });
  });

  describe("nextInt", () => {
    it("0 이상 max 이하의 정수 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(10);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it("max=0이면 0 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      expect(rng.nextInt(0)).toBe(0);
    });

    it("음수 max면 음수 결과", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const value = rng.nextInt(-10);
      expect(value).toBeLessThanOrEqual(0);
      expect(value).toBeGreaterThanOrEqual(-10);
    });

    it("max 없이 호출 시 53비트 정수 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const value = rng.nextInt();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(LiteHashDRBG.MAX_INT);
    });
  });

  describe("nextFloat1", () => {
    it("0.0 이상 1.0 이하의 실수 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat1();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it("결정론적 값 생성", () => {
      const rng1 = new LiteHashDRBG(FIXED_KEY);
      const rng2 = new LiteHashDRBG(FIXED_KEY);

      for (let i = 0; i < 10; i++) {
        expect(rng1.nextFloat1()).toBe(rng2.nextFloat1());
      }
    });
  });

  describe("상태 관리", () => {
    it("getState가 현재 상태 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const state1 = rng.getState();
      expect(state1.stateIdx).toBeGreaterThanOrEqual(0);
      expect(state1.bufferIdx).toBeGreaterThanOrEqual(0);

      rng.nextBytes(100);
      const state2 = rng.getState();
      expect(state2.stateIdx).toBeGreaterThan(state1.stateIdx);
    });

    it("동일한 stateIdx, bufferIdx로 복원 가능", () => {
      const rng1 = new LiteHashDRBG(FIXED_KEY);
      rng1.nextBytes(30);
      const state = rng1.getState();

      const rng2 = new LiteHashDRBG(FIXED_KEY, state.stateIdx - 1, state.bufferIdx);

      expect(rng1.nextBytes(10)).toEqual(rng2.nextBytes(10));
    });
  });
});

describe("RandUtil", () => {
  describe("shuffle", () => {
    it("배열 길이 유지", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const arr = [1, 2, 3, 4, 5];
      const shuffled = randUtil.shuffle(arr);
      expect(shuffled.length).toBe(arr.length);
    });

    it("원본 배열 불변", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      randUtil.shuffle(arr);
      expect(arr).toEqual(original);
    });

    it("모든 요소 포함", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const arr = [1, 2, 3, 4, 5];
      const shuffled = randUtil.shuffle(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it("빈 배열은 빈 배열 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      expect(randUtil.shuffle([])).toEqual([]);
    });

    it("단일 요소 배열은 그대로 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      expect(randUtil.shuffle([1])).toEqual([1]);
    });

    it("결정론적 셔플", () => {
      const rng1 = new LiteHashDRBG(FIXED_KEY);
      const rng2 = new LiteHashDRBG(FIXED_KEY);
      const randUtil1 = new RandUtil(rng1);
      const randUtil2 = new RandUtil(rng2);

      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(randUtil1.shuffle(arr)).toEqual(randUtil2.shuffle(arr));
    });
  });

  describe("choice", () => {
    it("배열에서 요소 선택", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const arr = [1, 2, 3, 4, 5];
      for (let i = 0; i < 20; i++) {
        expect(arr).toContain(randUtil.choice(arr));
      }
    });

    it("빈 배열에서 에러", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      expect(() => randUtil.choice([])).toThrow();
    });
  });

  describe("choiceUsingWeight", () => {
    it("가중치에 따라 선택", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const result = randUtil.choiceUsingWeight({
        a: 0.1,
        b: 10,
        c: 20,
      });

      expect(["a", "b", "c"]).toContain(result);
    });

    it("빈 객체에서 에러", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      expect(() => randUtil.choiceUsingWeight({})).toThrow();
    });

    it("음수 가중치는 0으로 취급", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const counts: Record<string, number> = { a: 0, b: 0 };
      for (let i = 0; i < 100; i++) {
        const rng2 = new LiteHashDRBG(`seed${i}`);
        const ru = new RandUtil(rng2);
        const result = ru.choiceUsingWeight({ a: 10, b: -5 });
        counts[result]++;
      }
      expect(counts["a"]).toBe(100);
    });
  });

  describe("choiceUsingWeightPair", () => {
    it("가중치 쌍에서 선택", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const items: [string, number][] = [
        ["apple", 10],
        ["banana", 5],
        ["cherry", 1],
      ];

      const result = randUtil.choiceUsingWeightPair(items);
      expect(["apple", "banana", "cherry"]).toContain(result);
    });

    it("빈 배열에서 에러", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      expect(() => randUtil.choiceUsingWeightPair([])).toThrow();
    });
  });

  describe("nextBool", () => {
    it("prob=1이면 항상 true", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      for (let i = 0; i < 10; i++) {
        expect(randUtil.nextBool(1)).toBe(true);
      }
    });

    it("prob=0이면 항상 false", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      for (let i = 0; i < 10; i++) {
        expect(randUtil.nextBool(0)).toBe(false);
      }
    });

    it("prob>1이면 true", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      expect(randUtil.nextBool(1.5)).toBe(true);
    });

    it("prob<0이면 false", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      expect(randUtil.nextBool(-0.5)).toBe(false);
    });
  });

  describe("nextRange / nextRangeInt", () => {
    it("nextRange는 [min, max) 범위의 실수 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      for (let i = 0; i < 100; i++) {
        const value = randUtil.nextRange(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThan(20);
      }
    });

    it("nextRangeInt는 [min, max] 범위의 정수 반환", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      for (let i = 0; i < 100; i++) {
        const value = randUtil.nextRangeInt(5, 10);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThanOrEqual(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it("min > max인 경우도 동작", () => {
      const rng = new LiteHashDRBG(FIXED_KEY);
      const randUtil = new RandUtil(rng);

      const value = randUtil.nextRangeInt(10, 5);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(10);
    });
  });
});
