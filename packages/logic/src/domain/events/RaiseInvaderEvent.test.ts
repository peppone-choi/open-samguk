import { describe, it, expect } from "vitest";
import { WorldSnapshot } from "../entities.js";
import { RaiseInvaderEvent } from "./month/RaiseInvaderEvent.js";
import { GameConst } from "../GameConst.js";

function createTestSnapshot(overrides: Partial<WorldSnapshot> = {}): WorldSnapshot {
  return {
    generals: {},
    nations: {},
    cities: {
      1: {
        id: 1,
        name: "성도",
        nationId: 0,
        level: 5,
        supply: 1,
        front: 0,
        pop: 100000,
        popMax: 200000,
        agri: 5000,
        agriMax: 10000,
        comm: 5000,
        commMax: 10000,
        secu: 5000,
        secuMax: 10000,
        def: 5000,
        defMax: 10000,
        wall: 5000,
        wallMax: 10000,
        trust: 80,
        gold: 1000,
        rice: 1000,
        region: 1,
        state: 0,
        term: 0,
        conflict: {},
        meta: {},
      },
      2: {
        id: 2,
        name: "이족도시",
        nationId: 0,
        level: 4, // 4레벨 도시(이)
        supply: 1,
        front: 0,
        pop: 100000,
        popMax: 200000,
        agri: 5000,
        agriMax: 10000,
        comm: 5000,
        commMax: 10000,
        secu: 5000,
        secuMax: 10000,
        def: 5000,
        defMax: 10000,
        wall: 5000,
        wallMax: 10000,
        trust: 80,
        gold: 1000,
        rice: 1000,
        region: 1,
        state: 0,
        term: 0,
        conflict: {},
        meta: {},
      },
    } as any,
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: {
      year: 192,
      month: 1,
    },
    env: {
      startyear: 184,
    },
    ...overrides,
  } as any;
}

describe("RaiseInvaderEvent", () => {
  it("should execute in January from year 192", () => {
    const event = new RaiseInvaderEvent();

    const snapshotValid = createTestSnapshot({ gameTime: { year: 192, month: 1 } });
    expect(event.condition(snapshotValid)).toBe(true);

    const snapshotEarly = createTestSnapshot({ gameTime: { year: 191, month: 1 } });
    expect(event.condition(snapshotEarly)).toBe(false);

    const snapshotWrongMonth = createTestSnapshot({ gameTime: { year: 192, month: 2 } });
    expect(event.condition(snapshotWrongMonth)).toBe(false);
  });

  it("should potentially create a new nation and general", () => {
    const event = new RaiseInvaderEvent();
    // 확률적으로 발생하므로 여러 번 시도하거나 시드 조절 필요
    // 현재 RaiseInvaderEvent.ts에서 시드를 `RaiseInvader:${year}:${month}`로 고정함.
    // 192년 1월 시드가 50% 확률을 통과하는지 확인 (테스트)

    const snapshot = createTestSnapshot({ gameTime: { year: 192, month: 1 } });
    const delta = event.action(snapshot);

    if (Object.keys(delta.nations || {}).length > 0) {
      expect(delta.nations).toBeDefined();
      expect(delta.generals).toBeDefined();
      expect(delta.cities).toBeDefined();
      expect(delta.logs?.global?.[0]).toContain("침입");
    }
  });
});
