import { describe, it, expect, beforeEach } from "vitest";
import { WorldState } from "./WorldState.js";
import { WorldSnapshot } from "./entities.js";

describe("WorldState (Domain Model)", () => {
  let initialState: WorldSnapshot;

  beforeEach(() => {
    initialState = {
      generals: {
        1: {
          id: 1,
          name: "유비",
          nationId: 1,
          cityId: 1,
          gold: 100,
          rice: 100,
          leadership: 7,
          leadershipExp: 0,
          strength: 7,
          strengthExp: 0,
          intel: 7,
          intelExp: 0,
          politics: 7,
          politicsExp: 0,
          charm: 8,
          charmExp: 0,
          injury: 0,
          experience: 0,
          dedication: 0,
          crew: 0,
          crewType: 0,
          train: 0,
          atmos: 0,
          age: 20,
          special: "None",
          specAge: 0,
          special2: "None",
          specAge2: 0,
          turnTime: new Date(),
          killTurn: 10,
          meta: {},
        },
      },
      nations: {},
      cities: {},
      gameTime: { year: 184, month: 1 },
    };
  });

  it("델타(Delta)를 적용하여 상태를 갱신해야 함", () => {
    const world = new WorldState(initialState);

    world.applyDelta({
      generals: {
        1: { gold: 200, rice: 300 },
      },
      gameTime: { month: 2 },
    });

    const state = world.getSnapshot();
    expect(state.generals[1].gold).toBe(200);
    expect(state.generals[1].rice).toBe(300);
    expect(state.gameTime.month).toBe(2);
  });

  it("저널을 재생(Replay)하여 상태를 복구해야 함", () => {
    const world = new WorldState(initialState);

    // 시뮬레이션된 저널
    const journal = {
      type: "turn_run",
      payload: {
        delta: {
          generals: { 1: { gold: 150 } },
        },
      },
    };

    world.applyJournal(journal as any);

    expect(world.getSnapshot().generals[1].gold).toBe(150);
  });

  it("스냅샷 데이터를 통해 상태를 통째로 복구해야 함", () => {
    const world = new WorldState(initialState);
    const newSnapshot: WorldSnapshot = {
      ...initialState,
      gameTime: { year: 200, month: 12 },
      generals: {
        2: { ...initialState.generals[1], id: 2, name: "관우" },
      },
    };

    world.restoreFromSnapshot(newSnapshot);

    const snapshot = world.getSnapshot();
    expect(snapshot.gameTime.year).toBe(200);
    expect(snapshot.generals[2]).toBeDefined();
    expect(snapshot.generals[1]).toBeUndefined();
  });
});
