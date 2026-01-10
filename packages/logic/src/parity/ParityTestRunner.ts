/**
 * 패리티 테스트 러너
 * 레거시 PHP와 신규 TypeScript 구현 간 비교 테스트 조정
 */

import {
  ParityTestCase,
  ParityComparisonResult,
  ParityDifference,
  ParityTestConfig,
  DEFAULT_PARITY_CONFIG,
  ParityCommandResult,
  ParitySnapshot,
  ParityDelta,
} from "./types.js";

export interface LegacyBridgeResponse {
  success: boolean;
  input: {
    command: string;
    args: Record<string, unknown>;
    generalId: number;
    rngSeed?: string;
  };
  result: unknown;
  delta: {
    added: Record<string, unknown[]>;
    modified: Record<string, unknown[]>;
    deleted: Record<string, unknown[]>;
  };
  beforeState: unknown;
  afterState: unknown;
  meta: {
    capturedAt: string;
    legacyUrl: string;
  };
}

export interface NewSystemExecutor {
  /**
   * 신규 TypeScript 시스템에서 명령 실행
   */
  execute(
    command: string,
    args: Record<string, unknown>,
    generalId: number,
    rngSeed: string
  ): Promise<ParityCommandResult>;

  /**
   * 신규 시스템 데이터베이스를 픽스처 상태로 초기화
   */
  reset(fixture: string): Promise<void>;

  /**
   * 현재 상태 스냅샷 캡처
   */
  captureSnapshot(): Promise<ParitySnapshot>;
}

/**
 * 패리티 테스트 러너 - 레거시와 신규 시스템 간 비교 조정
 */
export class ParityTestRunner {
  private config: ParityTestConfig;

  constructor(
    private newSystemExecutor: NewSystemExecutor,
    config: Partial<ParityTestConfig> = {}
  ) {
    this.config = { ...DEFAULT_PARITY_CONFIG, ...config };
  }

  /**
   * 단일 패리티 테스트 케이스 실행
   */
  async runTest(testCase: ParityTestCase): Promise<ParityComparisonResult> {
    const { command, fixture, skipLegacyComparison } = testCase;

    // 1. 양쪽 시스템을 픽스처 상태로 초기화
    await this.resetSystems(fixture);

    // 2. 신규 시스템에서 실행
    const newResult = await this.executeOnNewSystem(command);

    // 3. 레거시 시스템에서 실행 (스킵하지 않는 경우)
    let legacyResult: ParityCommandResult;
    if (skipLegacyComparison) {
      legacyResult = this.createSkippedResult();
    } else {
      legacyResult = await this.executeOnLegacy(command);
    }

    // 4. 결과 비교
    const differences = this.compareResults(legacyResult, newResult);
    const deltasMatch = differences.filter((d) => d.severity === "critical").length === 0;

    return {
      testCase,
      legacyResult,
      newResult,
      deltasMatch,
      differences,
      passed: deltasMatch,
    };
  }

  /**
   * 여러 테스트 케이스 실행
   */
  async runTests(testCases: ParityTestCase[]): Promise<ParityComparisonResult[]> {
    const results: ParityComparisonResult[] = [];

    for (const testCase of testCases) {
      try {
        const result = await this.runTest(testCase);
        results.push(result);
      } catch (error) {
        results.push({
          testCase,
          legacyResult: this.createErrorResult(error),
          newResult: this.createErrorResult(error),
          deltasMatch: false,
          differences: [
            {
              path: "execution",
              legacyValue: null,
              newValue: String(error),
              severity: "critical",
            },
          ],
          passed: false,
        });
      }
    }

    return results;
  }

  /**
   * 양쪽 시스템을 픽스처 상태로 초기화
   */
  private async resetSystems(fixture: string): Promise<void> {
    // 브릿지를 통해 레거시 초기화
    await this.callLegacyBridge("/reset", { fixture });

    // 신규 시스템 초기화
    await this.newSystemExecutor.reset(fixture);
  }

  /**
   * 신규 TypeScript 시스템에서 명령 실행
   */
  private async executeOnNewSystem(command: {
    command: string;
    args: Record<string, unknown>;
    generalId: number;
    rngSeed: string;
  }): Promise<ParityCommandResult> {
    const startTime = Date.now();

    try {
      const result = await this.newSystemExecutor.execute(
        command.command,
        command.args,
        command.generalId,
        command.rngSeed
      );
      return {
        ...result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        beforeState: {} as ParitySnapshot,
        afterState: {} as ParitySnapshot,
        delta: { added: {}, modified: {}, deleted: {} },
        error: String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 브릿지를 통해 레거시 PHP 시스템에서 명령 실행
   */
  private async executeOnLegacy(command: {
    command: string;
    args: Record<string, unknown>;
    generalId: number;
    rngSeed: string;
  }): Promise<ParityCommandResult> {
    const startTime = Date.now();

    try {
      const response = await this.callLegacyBridge<LegacyBridgeResponse>("/execute", {
        command: command.command,
        args: command.args,
        generalId: command.generalId,
        rngSeed: command.rngSeed,
      });

      return {
        success: response.success,
        beforeState: this.convertLegacySnapshot(response.beforeState),
        afterState: this.convertLegacySnapshot(response.afterState),
        delta: this.convertLegacyDelta(response.delta),
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        beforeState: {} as ParitySnapshot,
        afterState: {} as ParitySnapshot,
        delta: { added: {}, modified: {}, deleted: {} },
        error: String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 레거시 브릿지 서비스 호출
   */
  private async callLegacyBridge<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.config.legacyBridgeUrl}${endpoint}`;

    const response = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.config.legacyTimeout),
    });

    if (!response.ok) {
      throw new Error(`Legacy bridge error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * 레거시 스냅샷을 패리티 스냅샷 형식으로 변환
   */
  private convertLegacySnapshot(legacyState: unknown): ParitySnapshot {
    // parity-bridge에서 온 레거시 상태는 이미 WorldSnapshot 구조를 따름
    // ParitySnapshot 형식으로 매핑
    const state = legacyState as Record<string, unknown>;

    return {
      id: crypto.randomUUID(),
      capturedAt: new Date(state.capturedAt as string),
      source: "legacy",
      rngSeed: "",
      gameTime: ((state.gameEnv as Record<string, unknown>)?.gameTime as {
        year: number;
        month: number;
      }) || { year: 0, month: 0 },
      entities: {
        generals: this.extractEntities(state.generals),
        nations: this.extractEntities(state.nations),
        cities: this.extractEntities(state.cities),
        diplomacy: this.extractEntities(state.diplomacy),
        troops: this.extractEntities(state.troops),
        generalTurns: this.extractEntities(state.generalTurns),
        nationTurns: this.extractEntities(state.nationTurns),
        auctions: this.extractEntities(state.auctions),
        messages: this.extractEntities(state.messages),
      },
      env: (state.gameEnv as Record<string, unknown>) || {},
    };
  }

  /**
   * 레거시 테이블 스냅샷에서 엔티티 추출
   */
  private extractEntities(tableSnapshot: unknown): any[] {
    if (!tableSnapshot) return [];
    const snapshot = tableSnapshot as { rows?: Array<{ data: unknown }> };
    return (snapshot.rows || []).map((r) => r.data);
  }

  /**
   * 레거시 델타를 패리티 델타 형식으로 변환
   */
  private convertLegacyDelta(legacyDelta: unknown): ParityDelta {
    const delta = legacyDelta as {
      added?: Record<string, unknown[]>;
      modified?: Record<string, unknown[]>;
      deleted?: Record<string, unknown[]>;
    };

    return {
      added: delta.added || {},
      modified: delta.modified || {},
      deleted: delta.deleted || {},
    };
  }

  /**
   * 레거시와 신규 결과를 비교하여 차이점 탐색
   */
  private compareResults(
    legacyResult: ParityCommandResult,
    newResult: ParityCommandResult
  ): ParityDifference[] {
    const differences: ParityDifference[] = [];

    // 성공 상태 비교
    if (legacyResult.success !== newResult.success) {
      differences.push({
        path: "success",
        legacyValue: legacyResult.success,
        newValue: newResult.success,
        severity: "critical",
      });
    }

    // 델타 비교
    this.compareDelta(legacyResult.delta, newResult.delta, differences);

    return differences;
  }

  /**
   * 두 델타를 재귀적으로 비교
   */
  private compareDelta(
    legacyDelta: ParityDelta,
    newDelta: ParityDelta,
    differences: ParityDifference[],
    pathPrefix = "delta"
  ): void {
    // 추가된 엔티티 비교
    this.compareEntityGroups(legacyDelta.added, newDelta.added, differences, `${pathPrefix}.added`);

    // 수정된 엔티티 비교
    this.compareEntityGroups(
      legacyDelta.modified,
      newDelta.modified,
      differences,
      `${pathPrefix}.modified`
    );

    // 삭제된 엔티티 비교
    this.compareEntityGroups(
      legacyDelta.deleted,
      newDelta.deleted,
      differences,
      `${pathPrefix}.deleted`
    );
  }

  /**
   * 엔티티 그룹 비교 (예: added.generals vs added.generals)
   */
  private compareEntityGroups(
    legacyGroup: Record<string, unknown> | undefined,
    newGroup: Record<string, unknown> | undefined,
    differences: ParityDifference[],
    pathPrefix: string
  ): void {
    const allKeys = new Set([...Object.keys(legacyGroup || {}), ...Object.keys(newGroup || {})]);

    for (const key of allKeys) {
      // 무시할 필드는 건너뜀
      if (this.config.ignoreFields.some((f) => key.includes(f))) {
        continue;
      }

      const legacyValue = legacyGroup?.[key];
      const newValue = newGroup?.[key];
      const path = `${pathPrefix}.${key}`;

      if (!this.deepEqual(legacyValue, newValue)) {
        differences.push({
          path,
          legacyValue,
          newValue,
          severity: this.determineSeverity(key),
        });
      }
    }
  }

  /**
   * 숫자 허용 오차를 포함한 깊은 동등성 검사
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;

    // 숫자 허용 오차
    if (typeof a === "number" && typeof b === "number") {
      return Math.abs(a - b) <= this.config.numericTolerance;
    }

    // 배열
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => this.deepEqual(val, b[idx]));
    }

    // 객체
    if (typeof a === "object" && typeof b === "object") {
      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);

      for (const key of allKeys) {
        // 무시할 필드는 건너뜀
        if (this.config.ignoreFields.includes(key)) continue;
        if (!this.deepEqual(aObj[key], bObj[key])) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * 필드에 따라 차이점의 심각도 결정
   */
  private determineSeverity(field: string): "critical" | "warning" | "info" {
    // 정확히 일치해야 하는 중요 필드
    const criticalFields = [
      "gold",
      "rice",
      "crew",
      "train",
      "atmos",
      "injury",
      "experience",
      "dedication",
      "leadership",
      "strength",
      "intel",
      "pop",
      "agri",
      "comm",
      "secu",
      "def",
      "wall",
      "tech",
    ];

    if (criticalFields.some((f) => field.includes(f))) {
      return "critical";
    }

    // 경고 필드 - 중요하지만 허용 가능한 차이가 있을 수 있음
    const warningFields = ["message", "log", "name"];
    if (warningFields.some((f) => field.includes(f))) {
      return "warning";
    }

    return "info";
  }

  /**
   * 스킵된 결과 플레이스홀더 생성
   */
  private createSkippedResult(): ParityCommandResult {
    return {
      success: true,
      beforeState: {} as ParitySnapshot,
      afterState: {} as ParitySnapshot,
      delta: { added: {}, modified: {}, deleted: {} },
      executionTime: 0,
    };
  }

  /**
   * 에러 결과 생성
   */
  private createErrorResult(error: unknown): ParityCommandResult {
    return {
      success: false,
      beforeState: {} as ParitySnapshot,
      afterState: {} as ParitySnapshot,
      delta: { added: {}, modified: {}, deleted: {} },
      error: String(error),
      executionTime: 0,
    };
  }

  /**
   * 테스트 결과로부터 요약 보고서 생성
   */
  static generateReport(results: ParityComparisonResult[]): string {
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;

    const lines: string[] = [
      "=== Parity Test Report ===",
      `Total: ${total} | Passed: ${passed} | Failed: ${failed}`,
      "",
    ];

    for (const result of results) {
      const status = result.passed ? "[PASS]" : "[FAIL]";
      lines.push(`${status} ${result.testCase.name}`);

      if (!result.passed && result.differences.length > 0) {
        for (const diff of result.differences) {
          lines.push(
            `  - ${diff.path}: legacy=${JSON.stringify(diff.legacyValue)} new=${JSON.stringify(diff.newValue)} (${diff.severity})`
          );
        }
      }
    }

    lines.push("");
    lines.push(`Pass rate: ${((passed / total) * 100).toFixed(1)}%`);

    return lines.join("\n");
  }
}
