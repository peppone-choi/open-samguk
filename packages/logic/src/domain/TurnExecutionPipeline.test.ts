import { describe, it, expect, beforeEach } from "vitest";
import { TurnExecutionPipeline } from "./TurnExecutionPipeline.js";
import type { WorldSnapshot } from "./entities.js";
import { createMockGeneral } from "./test-utils.js";

describe("TurnExecutionPipeline (Phase 3)", () => {
  let snapshot: WorldSnapshot;

  beforeEach(() => {
    const baseDate = new Date("2026-01-01T00:00:00Z");
    snapshot = {
      generals: {
        1: createMockGeneral({
          id: 1,
          name: "유비",
          turnTime: baseDate,
          nationId: 1,
          cityId: 1,
        }),
        2: createMockGeneral({
          id: 2,
          name: "조조",
          turnTime: new Date(baseDate.getTime() - 1000),
          nationId: 2,
          cityId: 2,
        }),
      },
      nations: {},
      cities: {},
      diplomacy: {},
      troops: {},
      messages: {},
      gameTime: { year: 184, month: 1 },
      env: {},
    };
  });

  it("실행 대상 장수들을 turnTime 오름차순으로 정렬하여 처리해야 함", async () => {
    const pipeline = new TurnExecutionPipeline();

    // 조조(2번)가 유비(1번)보다 turnTime이 빠르므로 먼저 처리되어야 함
    const executableGeneralIds = pipeline.findExecutableGenerals(
      snapshot,
      new Date("2026-01-01T00:01:00Z")
    );

    expect(executableGeneralIds).toEqual([2, 1]);
  });
});
