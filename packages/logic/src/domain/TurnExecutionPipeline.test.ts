import { describe, it, expect, beforeEach } from "vitest";
import { TurnExecutionPipeline } from "./TurnExecutionPipeline.js";
import { WorldSnapshot } from "./entities.js";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";

describe("TurnExecutionPipeline (Phase 3)", () => {
  let snapshot: WorldSnapshot;

  beforeEach(() => {
    const baseDate = new Date("2026-01-01T00:00:00Z");
    snapshot = {
      generals: {
        1: {
          id: 1,
          name: "유비",
          turnTime: baseDate,
          gold: 100,
          leadership: 7,
          crew: 0,
          train: 0,
          experience: 0,
          dedication: 0,
          politics: 7,
          charm: 8,
          leadershipExp: 0,
          strength: 7,
          strengthExp: 0,
          intel: 7,
          intelExp: 0,
          politicsExp: 0,
          charmExp: 0,
          injury: 0,
          age: 20,
          special: "None",
          specAge: 0,
          special2: "None",
          specAge2: 0,
          nationId: 1,
          cityId: 1,
          rice: 100,
          atmos: 0,
          killTurn: 10,
          meta: {},
        },
        2: {
          id: 2,
          name: "조조",
          turnTime: new Date(baseDate.getTime() - 1000),
          gold: 100,
          leadership: 8,
          crew: 0,
          train: 0,
          experience: 0,
          dedication: 0,
          politics: 8,
          charm: 9,
          leadershipExp: 0,
          strength: 8,
          strengthExp: 0,
          intel: 8,
          intelExp: 0,
          politicsExp: 0,
          charmExp: 0,
          injury: 0,
          age: 20,
          special: "None",
          specAge: 0,
          special2: "None",
          specAge2: 0,
          nationId: 2,
          cityId: 2,
          rice: 100,
          atmos: 0,
          killTurn: 10,
          meta: {},
        },
      },
      nations: {},
      cities: {},
      gameTime: { year: 184, month: 1 },
    };
  });

  it("실행 대상 장수들을 turnTime 오름차순으로 정렬하여 처리해야 함", async () => {
    const pipeline = new TurnExecutionPipeline();

    // 조조(2번)가 유비(1번)보다 turnTime이 빠르므로 먼저 처리되어야 함
    const executableGeneralIds = pipeline.findExecutableGenerals(
      snapshot,
      new Date("2026-01-01T00:01:00Z"),
    );

    expect(executableGeneralIds).toEqual([2, 1]);
  });
});
