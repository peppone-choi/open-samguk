/**
 * Parity Test Runner
 * Coordinates testing between legacy PHP and new TypeScript implementations
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
   * Execute a command on the new TypeScript system
   */
  execute(
    command: string,
    args: Record<string, unknown>,
    generalId: number,
    rngSeed: string
  ): Promise<ParityCommandResult>;

  /**
   * Reset the new system database to a fixture state
   */
  reset(fixture: string): Promise<void>;

  /**
   * Capture current state snapshot
   */
  captureSnapshot(): Promise<ParitySnapshot>;
}

/**
 * Parity Test Runner - orchestrates comparison between legacy and new systems
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
   * Run a single parity test case
   */
  async runTest(testCase: ParityTestCase): Promise<ParityComparisonResult> {
    const { command, fixture, skipLegacyComparison } = testCase;

    // 1. Reset both systems to fixture state
    await this.resetSystems(fixture);

    // 2. Execute on new system
    const newResult = await this.executeOnNewSystem(command);

    // 3. Execute on legacy system (unless skipped)
    let legacyResult: ParityCommandResult;
    if (skipLegacyComparison) {
      legacyResult = this.createSkippedResult();
    } else {
      legacyResult = await this.executeOnLegacy(command);
    }

    // 4. Compare results
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
   * Run multiple test cases
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
   * Reset both systems to fixture state
   */
  private async resetSystems(fixture: string): Promise<void> {
    // Reset legacy via bridge
    await this.callLegacyBridge("/reset", { fixture });

    // Reset new system
    await this.newSystemExecutor.reset(fixture);
  }

  /**
   * Execute command on new TypeScript system
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
   * Execute command on legacy PHP system via bridge
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
   * Call the legacy bridge service
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
   * Convert legacy snapshot to parity snapshot format
   */
  private convertLegacySnapshot(legacyState: unknown): ParitySnapshot {
    // Legacy state from parity-bridge already follows WorldSnapshot structure
    // Map to ParitySnapshot format
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
   * Extract entities from legacy table snapshot
   */
  private extractEntities(tableSnapshot: unknown): any[] {
    if (!tableSnapshot) return [];
    const snapshot = tableSnapshot as { rows?: Array<{ data: unknown }> };
    return (snapshot.rows || []).map((r) => r.data);
  }

  /**
   * Convert legacy delta to parity delta format
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
   * Compare legacy and new results to find differences
   */
  private compareResults(
    legacyResult: ParityCommandResult,
    newResult: ParityCommandResult
  ): ParityDifference[] {
    const differences: ParityDifference[] = [];

    // Compare success status
    if (legacyResult.success !== newResult.success) {
      differences.push({
        path: "success",
        legacyValue: legacyResult.success,
        newValue: newResult.success,
        severity: "critical",
      });
    }

    // Compare deltas
    this.compareDelta(legacyResult.delta, newResult.delta, differences);

    return differences;
  }

  /**
   * Compare two deltas recursively
   */
  private compareDelta(
    legacyDelta: ParityDelta,
    newDelta: ParityDelta,
    differences: ParityDifference[],
    pathPrefix = "delta"
  ): void {
    // Compare added entities
    this.compareEntityGroups(legacyDelta.added, newDelta.added, differences, `${pathPrefix}.added`);

    // Compare modified entities
    this.compareEntityGroups(
      legacyDelta.modified,
      newDelta.modified,
      differences,
      `${pathPrefix}.modified`
    );

    // Compare deleted entities
    this.compareEntityGroups(
      legacyDelta.deleted,
      newDelta.deleted,
      differences,
      `${pathPrefix}.deleted`
    );
  }

  /**
   * Compare entity groups (e.g., added.generals vs added.generals)
   */
  private compareEntityGroups(
    legacyGroup: Record<string, unknown> | undefined,
    newGroup: Record<string, unknown> | undefined,
    differences: ParityDifference[],
    pathPrefix: string
  ): void {
    const allKeys = new Set([...Object.keys(legacyGroup || {}), ...Object.keys(newGroup || {})]);

    for (const key of allKeys) {
      // Skip ignored fields
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
   * Deep equality check with numeric tolerance
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;

    // Numeric tolerance
    if (typeof a === "number" && typeof b === "number") {
      return Math.abs(a - b) <= this.config.numericTolerance;
    }

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => this.deepEqual(val, b[idx]));
    }

    // Objects
    if (typeof a === "object" && typeof b === "object") {
      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);

      for (const key of allKeys) {
        // Skip ignored fields
        if (this.config.ignoreFields.includes(key)) continue;
        if (!this.deepEqual(aObj[key], bObj[key])) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Determine severity of a difference based on the field
   */
  private determineSeverity(field: string): "critical" | "warning" | "info" {
    // Critical fields that must match exactly
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

    // Warning fields - important but may have acceptable variance
    const warningFields = ["message", "log", "name"];
    if (warningFields.some((f) => field.includes(f))) {
      return "warning";
    }

    return "info";
  }

  /**
   * Create a skipped result placeholder
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
   * Create an error result
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
   * Generate a summary report from test results
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
