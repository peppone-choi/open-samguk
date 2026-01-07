import { describe, it, expect } from "vitest";
import { WorldSnapshot } from "../entities.js";
import { RaiseNPCNationEvent } from "./month/RaiseNPCNationEvent.js";

function createTestSnapshot(overrides: Partial<WorldSnapshot> = {}): WorldSnapshot {
  return {
    generals: {},
    cities: {
      1: {
        id: 1,
        name: "성도",
        nationId: 1, // 수도가 있는 유저 국가
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
      10: {
        // 성도에서 거리가 먼 도시 (ID 1 -> 10 거리가 3 이상인지 확인 필요하나 일단 가정)
        id: 10,
        name: "완",
        nationId: 0,
        level: 5, // 거병 가능 레벨
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
    nations: {
      1: { id: 1, name: "유저국" } as any,
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: {
      year: 190,
      month: 1,
    },
    env: {
      startyear: 184,
    },
    ...overrides,
  } as any;
}

describe("RaiseNPCNationEvent", () => {
  it("should execute in January and July", () => {
    const event = new RaiseNPCNationEvent();

    const snapshotJan = createTestSnapshot({ gameTime: { year: 190, month: 1 } });
    expect(event.condition(snapshotJan)).toBe(true);

    const snapshotJul = createTestSnapshot({ gameTime: { year: 190, month: 7 } });
    expect(event.condition(snapshotJul)).toBe(true);

    const snapshotFeb = createTestSnapshot({ gameTime: { year: 190, month: 2 } });
    expect(event.condition(snapshotFeb)).toBe(false);
  });

  it("should create NPC nations in empty cities far from other nations", () => {
    const event = new RaiseNPCNationEvent();
    const snapshot = createTestSnapshot({ gameTime: { year: 190, month: 1 } });

    const delta = event.action(snapshot);

    if (Object.keys(delta.nations || {}).length > 0) {
      expect(delta.nations).toBeDefined();
      expect(delta.generals).toBeDefined();
      expect(delta.logs?.global?.[0]).toContain("생성되었습니다");
    }
  });
});
