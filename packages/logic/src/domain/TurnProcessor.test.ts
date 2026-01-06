import { describe, it, expect } from "vitest";
import { TurnProcessor } from "./TurnProcessor.js";
import { WorldSnapshot } from "./entities.js";

describe("TurnProcessor", () => {
  it("should produce deterministic results with same seed", () => {
    const seed = "test-seed";
    const processor = new TurnProcessor(seed);
    const snapshot: WorldSnapshot = {
      generals: {
        1: {
          id: 1,
          name: "유비",
          nationId: 1,
          cityId: 1,
          gold: 100,
          rice: 100,
          leadership: 70,
          strength: 70,
          intel: 70,
          injury: 0,
          turnTime: new Date(),
          killTurn: 10,
          meta: {},
        },
      },
      nations: {},
      cities: {},
      gameTime: { year: 184, month: 1 },
    };

    const delta1 = processor.processGeneralTurn(snapshot, 1);
    const delta2 = processor.processGeneralTurn(snapshot, 1);

    expect(delta1).toEqual(delta2);
    expect(delta1.generals?.[1]?.gold).toBeGreaterThan(100);
    expect(delta1.generals?.[1]?.rice).toBeGreaterThan(100);
  });

  it("should produce different results with different seeds", () => {
    const snapshot: WorldSnapshot = {
      generals: {
        1: {
          id: 1,
          name: "유비",
          nationId: 1,
          cityId: 1,
          gold: 100,
          rice: 100,
          leadership: 70,
          strength: 70,
          intel: 70,
          injury: 0,
          turnTime: new Date(),
          killTurn: 10,
          meta: {},
        },
      },
      nations: {},
      cities: {},
      gameTime: { year: 184, month: 1 },
    };

    const delta1 = new TurnProcessor("seed-1").processGeneralTurn(snapshot, 1);
    const delta2 = new TurnProcessor("seed-2").processGeneralTurn(snapshot, 1);

    expect(delta1).not.toEqual(delta2);
  });
});
