import type { RNG } from "./RNG.js";

/**
 * RNG를 사용한 고급 난수 유틸리티
 *
 * 가중치 선택, 셔플, 범위 난수 등 게임에 필요한 다양한 난수 기능 제공
 */
export class RandUtil {
  constructor(public readonly rng: RNG) {}

  /**
   * 0.0 이상 1.0 이하의 난수 실수 반환
   */
  nextFloat1(): number {
    return this.rng.nextFloat1();
  }

  /**
   * [min, max) 범위의 난수 실수 반환
   *
   * @param min - 최솟값 (포함)
   * @param max - 최댓값 (미포함)
   */
  nextRange(min: number, max: number): number {
    const range = max - min;
    return this.nextFloat1() * range + min;
  }

  /**
   * [min, max] 범위의 난수 정수 반환
   *
   * @param min - 최솟값 (포함)
   * @param max - 최댓값 (포함)
   */
  nextRangeInt(min: number, max: number): number {
    const range = max - min;
    if (range > this.rng.getMaxInt()) {
      throw new Error("Invalid random int range");
    }
    return this.rng.nextInt(range) + min;
  }

  /**
   * 0 이상 max 이하의 난수 정수 반환
   *
   * @param max - 최댓값 (포함). null이면 RNG의 최대값 사용
   */
  nextInt(max?: number | null): number {
    return this.rng.nextInt(max);
  }

  /**
   * 랜덤 비트 반환 (true/false)
   */
  nextBit(): boolean {
    const bytes = this.rng.nextBits(1);
    return bytes[0] !== 0;
  }

  /**
   * 지정된 확률로 true 반환
   *
   * @param prob - 확률 (0.0 ~ 1.0). 기본값 0.5
   */
  nextBool(prob = 0.5): boolean {
    if (prob >= 1) {
      return true;
    }
    if (prob === 0.5) {
      return this.nextBit();
    }
    if (prob <= 0) {
      return false;
    }
    return this.nextFloat1() < prob;
  }

  /**
   * 배열을 무작위로 섞음 (Fisher-Yates shuffle)
   *
   * @param srcArray - 원본 배열
   * @returns 새로운 섞인 배열 (원본 불변)
   */
  shuffle<T>(srcArray: T[]): T[] {
    if (!srcArray || srcArray.length === 0) {
      return srcArray;
    }

    const cnt = srcArray.length;
    if (cnt > this.rng.getMaxInt()) {
      throw new Error("Invalid random int range");
    }

    const result = [...srcArray];

    for (let srcIdx = 0; srcIdx < cnt - 1; srcIdx++) {
      const destIdx = this.rng.nextInt(cnt - srcIdx - 1) + srcIdx;
      if (srcIdx !== destIdx) {
        const tmp = result[srcIdx];
        result[srcIdx] = result[destIdx];
        result[destIdx] = tmp;
      }
    }

    return result;
  }

  /**
   * 객체(Map/Record)의 키를 무작위로 섞어 새로운 객체 반환
   *
   * @param srcMap - 원본 객체
   * @returns 키가 섞인 새로운 객체
   */
  shuffleAssoc<K extends string | number | symbol, V>(srcMap: Record<K, V>): Record<K, V> {
    if (!srcMap || Object.keys(srcMap).length === 0) {
      return srcMap;
    }

    const result = {} as Record<K, V>;
    const shuffledKeys = this.shuffle(Object.keys(srcMap) as K[]);

    for (const key of shuffledKeys) {
      result[key] = srcMap[key];
    }

    return result;
  }

  /**
   * 배열/객체에서 무작위로 하나 선택
   *
   * @param items - 선택할 대상 배열 또는 객체
   * @returns 선택된 값
   */
  choice<T>(items: T[] | Record<string | number, T>): T {
    const keys = Object.keys(items);
    if (keys.length === 0) {
      throw new Error("Cannot choice from empty collection");
    }

    const keyIdx = this.rng.nextInt(keys.length - 1);
    const key = keys[keyIdx];
    return (items as Record<string, T>)[key];
  }

  /**
   * 가중치 기반 선택 (객체 형태: {item: weight, ...})
   *
   * @param items - 아이템과 가중치가 매핑된 객체
   * @returns 선택된 키
   */
  choiceUsingWeight<K extends string | number>(items: Record<K, number>): K {
    if (!items || Object.keys(items).length === 0) {
      throw new Error("Cannot choice from empty collection");
    }

    let sum = 0;
    for (const value of Object.values<number>(items)) {
      if (value > 0) {
        sum += value;
      }
    }

    let rd = this.nextFloat1() * sum;
    for (const [item, value] of Object.entries<number>(items)) {
      const weight = value <= 0 ? 0 : value;
      if (rd <= weight) {
        return item as K;
      }
      rd -= weight;
    }

    // fallback (이론상 도달 불가)
    const keys = Object.keys(items);
    return keys[keys.length - 1] as K;
  }

  /**
   * 가중치 기반 선택 (배열 형태: [[item, weight], ...])
   *
   * @param items - [아이템, 가중치] 쌍의 배열
   * @returns 선택된 아이템
   */
  choiceUsingWeightPair<T>(items: [T, number][]): T {
    if (!items || items.length === 0) {
      throw new Error("Cannot choice from empty collection");
    }

    let sum = 0;
    for (const [, value] of items) {
      if (value > 0) {
        sum += value;
      }
    }

    let rd = this.nextFloat1() * sum;
    for (const [item, value] of items) {
      const weight = value <= 0 ? 0 : value;
      if (rd <= weight) {
        return item;
      }
      rd -= weight;
    }

    // fallback (이론상 도달 불가)
    return items[items.length - 1][0];
  }
}
