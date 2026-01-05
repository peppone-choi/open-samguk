import { WorldSnapshot, WorldDelta } from "../domain/entities.js";

/**
 * 구조화된 로그 출력
 */
export interface ParityLog {
  general: Record<number, string[]>;
  nation: Record<number, string[]>;
  global: string[];
}

/**
 * 패리티 테스트 메트릭
 */
export interface ParityMetrics {
  rngCalls?: number;
  deltaSize?: number;
  executionTimeMs?: number;
  [key: string]: number | undefined;
}

/**
 * 비교 옵션
 */
export interface CompareOptions {
  /** 부동소수점 허용 오차 (기본: 1e-10) */
  floatTolerance?: number;
  /** Date 필드 무시 */
  ignoreTimestamps?: boolean;
  /** undefined/null 동일 취급 */
  ignoreUndefined?: boolean;
  /** 배열 정렬 후 비교 */
  sortArrays?: boolean;
  /** 배열 정렬 기준 키 (기본: 'id') */
  arrayIdKey?: string;
}

/**
 * 비교 결과 차이점
 */
export interface ParityDiff {
  path: string;
  expected: unknown;
  actual: unknown;
  type: "missing" | "extra" | "mismatch" | "type_mismatch";
}

/**
 * 단일 테스트 케이스 결과
 */
export interface ParityResult {
  name: string;
  passed: boolean;
  diffs: ParityDiff[];
  executionTimeMs: number;
  error?: string;
}

/**
 * 전체 테스트 요약
 */
export interface ParitySummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: ParityResult[];
  totalTimeMs: number;
}

/**
 * 패리티 테스트 입력
 */
export interface ParityInput {
  snapshot: WorldSnapshot;
  seed: string;
  command?: {
    type: string;
    arg: Record<string, unknown>;
    actorId: number;
  };
}

/**
 * 패리티 테스트 출력
 */
export interface ParityOutput {
  delta: WorldDelta;
  logs: ParityLog;
  metrics?: ParityMetrics;
}

/**
 * 패리티 테스트 케이스
 */
export interface ParityCase {
  name: string;
  input: ParityInput;
  expected: ParityOutput;
}
