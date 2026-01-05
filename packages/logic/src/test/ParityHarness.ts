import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { CommandFactory } from "../domain/CommandFactory.js";
import { WorldDelta } from "../domain/entities.js";
import {
  ParityInput,
  ParityOutput,
  ParityCase,
  ParityLog,
  ParityDiff,
  ParityResult,
  ParitySummary,
  CompareOptions,
} from "./types.js";

const DEFAULT_OPTIONS: Required<CompareOptions> = {
  floatTolerance: 1e-10,
  ignoreTimestamps: false,
  ignoreUndefined: true,
  sortArrays: true,
  arrayIdKey: "id",
};

/**
 * 패리티 테스트 하네스
 * 레거시와 신규 코드의 결과를 비교하여 결정론 검증
 */
export class ParityHarness {
  private options: Required<CompareOptions>;

  constructor(options?: Partial<CompareOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 단일 테스트 케이스 실행
   */
  runCase(testCase: ParityCase): ParityResult {
    const startTime = performance.now();

    try {
      const actual = this.execute(testCase.input);
      const normalizedActual = this.normalize(actual);
      const normalizedExpected = this.normalize(testCase.expected);

      const diffs = this.compare(normalizedExpected, normalizedActual, "");

      return {
        name: testCase.name,
        passed: diffs.length === 0,
        diffs,
        executionTimeMs: performance.now() - startTime,
      };
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        diffs: [],
        executionTimeMs: performance.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 전체 테스트 케이스 실행
   */
  runAll(cases: ParityCase[]): ParitySummary {
    const startTime = performance.now();
    const results: ParityResult[] = [];

    for (const testCase of cases) {
      results.push(this.runCase(testCase));
    }

    const passed = results.filter((r) => r.passed).length;
    const skipped = results.filter((r) => !!r.error).length;

    return {
      total: cases.length,
      passed,
      failed: cases.length - passed - skipped,
      skipped,
      results,
      totalTimeMs: performance.now() - startTime,
    };
  }

  /**
   * 커맨드 실행
   */
  private execute(input: ParityInput): ParityOutput {
    const rng = new LiteHashDRBG(input.seed);
    const rand = new RandUtil(rng);

    if (!input.command) {
      return {
        delta: {},
        logs: { general: {}, nation: {}, global: [] },
      };
    }

    const cmd = CommandFactory.create(input.command.type);
    const delta = cmd.run(
      rand,
      input.snapshot,
      input.command.actorId,
      input.command.arg,
    );

    return {
      delta,
      logs: this.extractLogs(delta),
    };
  }

  /**
   * 델타에서 로그 추출
   */
  private extractLogs(delta: WorldDelta): ParityLog {
    return {
      general: delta.logs?.general ?? {},
      nation: delta.logs?.nation ?? {},
      global: delta.logs?.global ?? [],
    };
  }

  /**
   * 출력 정규화
   */
  normalize(output: ParityOutput): ParityOutput {
    return {
      delta: this.normalizeDelta(output.delta),
      logs: this.normalizeLogs(output.logs),
      metrics: output.metrics ? this.sortObjectKeys(output.metrics) : undefined,
    };
  }

  /**
   * 델타 정규화
   */
  private normalizeDelta(delta: WorldDelta): WorldDelta {
    const result: WorldDelta = {};

    if (delta.generals) {
      result.generals = this.normalizeEntityMap(delta.generals);
    }
    if (delta.nations) {
      result.nations = this.normalizeEntityMap(delta.nations);
    }
    if (delta.cities) {
      result.cities = this.normalizeEntityMap(delta.cities);
    }
    if (delta.diplomacy) {
      result.diplomacy = this.normalizeEntityMap(delta.diplomacy);
    }
    if (delta.troops) {
      result.troops = this.normalizeEntityMap(delta.troops);
    }
    if (delta.messages) {
      result.messages = [...delta.messages].sort((a, b) => a.id - b.id);
    }
    if (delta.deleteMessages) {
      result.deleteMessages = [...delta.deleteMessages].sort((a, b) => a - b);
    }
    if (delta.gameTime) {
      result.gameTime = this.sortObjectKeys(delta.gameTime);
    }
    if (delta.env) {
      result.env = this.sortObjectKeys(delta.env);
    }
    if (delta.logs) {
      result.logs = {
        general: this.normalizeLogMap(delta.logs.general ?? {}),
        nation: this.normalizeLogMap(delta.logs.nation ?? {}),
        global: [...(delta.logs.global ?? [])].sort(),
      };
    }

    return this.sortObjectKeys(result);
  }

  /**
   * 엔티티 맵 정규화
   */
  private normalizeEntityMap<T>(
    map: Record<number | string, T>,
  ): Record<number | string, T> {
    const result: Record<number | string, T> = {};
    const sortedKeys = Object.keys(map).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    for (const key of sortedKeys) {
      const value = map[key];
      if (typeof value === "object" && value !== null) {
        result[key] = this.normalizeEntity(
          value as Record<string, unknown>,
        ) as T;
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 단일 엔티티 정규화
   */
  private normalizeEntity(
    entity: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(entity)) {
      if (value instanceof Date) {
        result[key] = this.options.ignoreTimestamps
          ? null
          : value.toISOString();
        continue;
      }
      if (value === undefined) {
        if (!this.options.ignoreUndefined) {
          result[key] = null;
        }
        continue;
      }
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          result[key] = value.map((v) =>
            typeof v === "object" && v !== null
              ? this.normalizeEntity(v as Record<string, unknown>)
              : v,
          );
        } else {
          result[key] = this.normalizeEntity(value as Record<string, unknown>);
        }
        continue;
      }
      result[key] = value;
    }

    return this.sortObjectKeys(result);
  }

  /**
   * 로그 정규화
   */
  private normalizeLogs(logs: ParityLog): ParityLog {
    return {
      general: this.normalizeLogMap(logs.general),
      nation: this.normalizeLogMap(logs.nation),
      global: [...logs.global].sort(),
    };
  }

  /**
   * 로그 맵 정규화
   */
  private normalizeLogMap(
    map: Record<number, string[]>,
  ): Record<number, string[]> {
    const result: Record<number, string[]> = {};
    const sortedKeys = Object.keys(map)
      .map(Number)
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    for (const key of sortedKeys) {
      result[key] = [...map[key]].sort();
    }

    return result;
  }

  /**
   * 객체 키 정렬
   */
  private sortObjectKeys<T extends object>(obj: T): T {
    const result: Record<string, unknown> = {};
    const sortedKeys = Object.keys(obj).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    for (const key of sortedKeys) {
      result[key] = (obj as Record<string, unknown>)[key];
    }

    return result as T;
  }

  /**
   * 깊은 비교 (허용 오차 포함)
   */
  private compare(
    expected: unknown,
    actual: unknown,
    path: string,
  ): ParityDiff[] {
    const diffs: ParityDiff[] = [];

    // undefined/null 처리
    if (this.options.ignoreUndefined) {
      if (expected === undefined) expected = null;
      if (actual === undefined) actual = null;
    }

    // 타입 불일치
    if (typeof expected !== typeof actual) {
      diffs.push({ path, expected, actual, type: "type_mismatch" });
      return diffs;
    }

    // null 체크
    if (expected === null && actual === null) return diffs;
    if (expected === null || actual === null) {
      diffs.push({ path, expected, actual, type: "mismatch" });
      return diffs;
    }

    // 숫자 비교 (허용 오차)
    if (typeof expected === "number" && typeof actual === "number") {
      if (Math.abs(expected - actual) > this.options.floatTolerance) {
        diffs.push({ path, expected, actual, type: "mismatch" });
      }
      return diffs;
    }

    // Date 비교
    if (expected instanceof Date && actual instanceof Date) {
      if (this.options.ignoreTimestamps) return diffs;
      if (expected.getTime() !== actual.getTime()) {
        diffs.push({ path, expected, actual, type: "mismatch" });
      }
      return diffs;
    }

    // 배열 비교
    if (Array.isArray(expected) && Array.isArray(actual)) {
      const sortedExpected = this.sortArray(expected);
      const sortedActual = this.sortArray(actual);

      const maxLen = Math.max(sortedExpected.length, sortedActual.length);
      for (let i = 0; i < maxLen; i++) {
        const subPath = `${path}[${i}]`;
        if (i >= sortedExpected.length) {
          diffs.push({
            path: subPath,
            expected: undefined,
            actual: sortedActual[i],
            type: "extra",
          });
        } else if (i >= sortedActual.length) {
          diffs.push({
            path: subPath,
            expected: sortedExpected[i],
            actual: undefined,
            type: "missing",
          });
        } else {
          diffs.push(
            ...this.compare(sortedExpected[i], sortedActual[i], subPath),
          );
        }
      }
      return diffs;
    }

    // 객체 비교
    if (typeof expected === "object" && typeof actual === "object") {
      const expObj = expected as Record<string, unknown>;
      const actObj = actual as Record<string, unknown>;
      const allKeysSet = new Set([
        ...Object.keys(expObj),
        ...Object.keys(actObj),
      ]);
      const allKeys = Array.from(allKeysSet);

      for (const key of allKeys) {
        const expVal = expObj[key];
        const actVal = actObj[key];
        const subPath = path ? `${path}.${key}` : key;

        // ignoreUndefined는 양쪽 모두 nullish일 때만 적용
        // 한쪽만 값이 있으면 차이로 기록
        const expNullish = expVal === undefined || expVal === null;
        const actNullish = actVal === undefined || actVal === null;

        if (expNullish && actNullish) {
          // 양쪽 모두 nullish - ignoreUndefined일 때 무시
          if (!this.options.ignoreUndefined) {
            if (expVal !== actVal) {
              diffs.push({
                path: subPath,
                expected: expVal,
                actual: actVal,
                type: "mismatch",
              });
            }
          }
        } else if (expNullish && !actNullish) {
          // expected는 nullish, actual은 값 있음 - extra
          diffs.push({
            path: subPath,
            expected: expVal,
            actual: actVal,
            type: "extra",
          });
        } else if (!expNullish && actNullish) {
          // expected는 값 있음, actual은 nullish - missing
          diffs.push({
            path: subPath,
            expected: expVal,
            actual: actVal,
            type: "missing",
          });
        } else {
          // 양쪽 모두 값 있음 - 재귀 비교
          diffs.push(...this.compare(expVal, actVal, subPath));
        }
      }
      return diffs;
    }

    // 원시값 비교
    if (expected !== actual) {
      diffs.push({ path, expected, actual, type: "mismatch" });
    }

    return diffs;
  }

  /**
   * 배열 정렬
   */
  private sortArray<T>(arr: T[]): T[] {
    if (!this.options.sortArrays) return arr;

    const sorted = [...arr];
    sorted.sort((a, b) => {
      // ID 기반 정렬
      if (
        typeof a === "object" &&
        a !== null &&
        typeof b === "object" &&
        b !== null
      ) {
        const aId = (a as Record<string, unknown>)[this.options.arrayIdKey];
        const bId = (b as Record<string, unknown>)[this.options.arrayIdKey];
        if (typeof aId === "number" && typeof bId === "number") {
          return aId - bId;
        }
        if (typeof aId === "string" && typeof bId === "string") {
          return aId.localeCompare(bId);
        }
      }
      // 문자열 정렬
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b);
      }
      // 숫자 정렬
      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }
      return 0;
    });
    return sorted;
  }
}

/**
 * 레거시 호환용 함수 (deprecated)
 * @deprecated ParityHarness 클래스를 사용하세요
 */
export function normalizeParityOutput(output: ParityOutput): ParityOutput {
  const harness = new ParityHarness();
  return harness.normalize(output);
}
