import { describe, it, expect } from "vitest";
import { HasRouteConstraint } from "./HasRouteConstraint.js";
import { HasRouteWithEnemyConstraint } from "./HasRouteWithEnemyConstraint.js";
import { General, Nation, City, WorldSnapshot, Diplomacy } from "../entities.js";
import { SnapshotStateView } from "../Command.js";

describe("RouteConstraints", () => {
  const mockGeneral = (overrides: Partial<General> = {}): General => ({
    id: 1,
    name: "G1",
    nationId: 1,
    cityId: 5,
    npc: 0,
    gold: 0,
    rice: 0,
    leadership: 0,
    leadershipExp: 0,
    strength: 0,
    strengthExp: 0,
    intel: 0,
    intelExp: 0,
    politics: 0,
    politicsExp: 0,
    charm: 0,
    charmExp: 0,
    injury: 0,
    experience: 0,
    dedication: 0,
    officerLevel: 0,
    officerCity: 0,
    recentWar: 0,
    crew: 0,
    crewType: 0,
    train: 0,
    atmos: 0,
    dex: {},
    age: 0,
    bornYear: 0,
    deadYear: 0,
    special: "",
    specAge: 0,
    special2: "",
    specAge2: 0,
    weapon: "",
    book: "",
    horse: "",
    item: "",
    turnTime: new Date(),
    recentWarTime: null,
    makeLimit: 0,
    killTurn: 0,
    block: 0,
    defenceTrain: 0,
    tournamentState: 0,
    lastTurn: {},
    meta: {},
    penalty: {},
    ownerId: 1,
    troopId: 0,
    startAge: 20,
    belong: 1,
    betray: 0,
    dedLevel: 0,
    expLevel: 0,
    officerLock: 0,
    affinity: 500,
    personal: "None",
    ...overrides,
  });

  const mockCity = (id: number, nationId: number): City => ({
    id,
    name: `C${id}`,
    nationId,
    level: 1,
    supply: 1,
    front: 0,
    pop: 0,
    popMax: 0,
    agri: 0,
    agriMax: 0,
    comm: 0,
    commMax: 0,
    secu: 0,
    secuMax: 0,
    def: 0,
    defMax: 0,
    wall: 0,
    wallMax: 0,
    trust: 0,
    trade: 100,
    dead: 0,
    region: 1,
    state: 0,
    term: 0,
    conflict: {},
    meta: {},
  });

  const baseSnapshot: WorldSnapshot = {
    generals: { 1: mockGeneral() },
    nations: { 1: { id: 1, name: "N1" } as any },
    cities: {
      5: mockCity(5, 1),
      1: mockCity(1, 1), // 업 (특) - 5번은 성도(특) 이라 좀 멀수도. MapData 참조
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 0, month: 0 },
    env: {},
    generalTurns: {},
  };

  describe("HasRouteConstraint", () => {
    it("직접 연결된 자국 도시면 통과해야 함", () => {
      const constraint = new HasRouteConstraint();
      // 성도(5) -> 강주(27) 는 연결됨
      const snapshot: WorldSnapshot = {
        ...baseSnapshot,
        cities: {
          5: mockCity(5, 1),
          27: mockCity(27, 1),
        },
      };
      const view = new SnapshotStateView(snapshot);
      const ctx = { actorId: 1, args: { destCityId: 27 }, env: {}, mode: "full" as const };
      expect(constraint.test(ctx, view).kind).toBe("allow");
    });

    it("연결되지 않았으면 실패해야 함", () => {
      const constraint = new HasRouteConstraint();
      const snapshot: WorldSnapshot = {
        ...baseSnapshot,
        cities: {
          5: mockCity(5, 1),
          1: mockCity(1, 1), // 업 (멀리 있음)
        },
      };
      const view = new SnapshotStateView(snapshot);
      const ctx = { actorId: 1, args: { destCityId: 1 }, env: {}, mode: "full" as const };
      expect(constraint.test(ctx, view).kind).toBe("deny");
    });
  });

  describe("HasRouteWithEnemyConstraint", () => {
    it("공백지를 거쳐서 갈 수 있으면 통과해야 함", () => {
      const constraint = new HasRouteWithEnemyConstraint();
      // 성도(5) -> 강주(27)
      const snapshot: WorldSnapshot = {
        ...baseSnapshot,
        cities: {
          5: mockCity(5, 1),
          27: mockCity(27, 0), // 공백지
        },
      };
      const view = new SnapshotStateView(snapshot);
      const ctx = { actorId: 1, args: { destCityId: 27 }, env: {}, mode: "full" as const };
      expect(constraint.test(ctx, view).kind).toBe("allow");
    });

    it("교전 중인 국가를 거쳐서 갈 수 있으면 통과해야 함", () => {
      const constraint = new HasRouteWithEnemyConstraint();
      const snapshot: WorldSnapshot = {
        ...baseSnapshot,
        cities: {
          5: mockCity(5, 1),
          27: mockCity(27, 2), // 타국
        },
        diplomacy: {
          "1:2": { id: 1, srcNationId: 1, destNationId: 2, state: "0", term: 12, meta: {} },
        },
      };
      const view = new SnapshotStateView(snapshot);
      const ctx = { actorId: 1, args: { destCityId: 27 }, env: {}, mode: "full" as const };
      expect(constraint.test(ctx, view).kind).toBe("allow");
    });

    it("평화 상태인 타국은 거치지 못하므로 실패해야 함", () => {
      const constraint = new HasRouteWithEnemyConstraint();
      const snapshot: WorldSnapshot = {
        ...baseSnapshot,
        cities: {
          5: mockCity(5, 1),
          27: mockCity(27, 2), // 타국
        },
        diplomacy: {
          "1:2": { id: 1, srcNationId: 1, destNationId: 2, state: "2", term: 12, meta: {} }, // 동맹
        },
      };
      const view = new SnapshotStateView(snapshot);
      const ctx = { actorId: 1, args: { destCityId: 27 }, env: {}, mode: "full" as const };
      expect(constraint.test(ctx, view).kind).toBe("deny");
    });
  });
});
