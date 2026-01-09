import { describe, it, expect } from "vitest";
import { ReqGeneralCrewMarginConstraint } from "./ReqGeneralCrewMarginConstraint.js";
import { ReqTroopMembersConstraint } from "./ReqTroopMembersConstraint.js";
import { General, WorldSnapshot } from "../entities.js";
import { SnapshotStateView } from "../Command.js";

describe("CrewAndTroopConstraints", () => {
  const mockGeneral = (id: number, overrides: Partial<General> = {}): General => ({
    id,
    name: `G${id}`,
    nationId: 1,
    cityId: 1,
    npc: 0,
    gold: 0,
    rice: 0,
    leadership: 10,
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
    crewType: 1,
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

  describe("ReqGeneralCrewMarginConstraint", () => {
    it("병력이 가득 차지 않았으면 허용해야 함", () => {
      const constraint = new ReqGeneralCrewMarginConstraint(1);
      const general = mockGeneral(1, { leadership: 10, crew: 500, crewType: 1 });
      const view = new SnapshotStateView({ generals: { 1: general } } as any);
      expect(constraint.test({ actorId: 1 } as any, view).kind).toBe("allow");
    });

    it("병력이 가득 찼으면 거절해야 함", () => {
      const constraint = new ReqGeneralCrewMarginConstraint(1);
      const general = mockGeneral(1, { leadership: 10, crew: 1000, crewType: 1 });
      const view = new SnapshotStateView({ generals: { 1: general } } as any);
      expect(constraint.test({ actorId: 1 } as any, view).kind).toBe("deny");
    });

    it("병종이 다르면 여유분과 상관없이 허용해야 함", () => {
      const constraint = new ReqGeneralCrewMarginConstraint(2); // 다른 병종
      const general = mockGeneral(1, { leadership: 10, crew: 1000, crewType: 1 });
      const view = new SnapshotStateView({ generals: { 1: general } } as any);
      expect(constraint.test({ actorId: 1 } as any, view).kind).toBe("allow");
    });
  });

  describe("ReqTroopMembersConstraint", () => {
    it("부대에 본인 외의 멤버가 있으면 허용해야 함", () => {
      const constraint = new ReqTroopMembersConstraint();
      const g1 = mockGeneral(1, { troopId: 100 });
      const g2 = mockGeneral(2, { troopId: 100 });
      const snapshot: WorldSnapshot = {
        generals: { 1: g1, 2: g2 },
        nations: {},
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
        generalTurns: {},
      };
      const view = new SnapshotStateView(snapshot);
      expect(constraint.test({ actorId: 1 } as any, view).kind).toBe("allow");
    });

    it("부대에 본인뿐이면 거절해야 함", () => {
      const constraint = new ReqTroopMembersConstraint();
      const g1 = mockGeneral(1, { troopId: 100 });
      const snapshot: WorldSnapshot = {
        generals: { 1: g1 },
        nations: {},
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
        generalTurns: {},
      };
      const view = new SnapshotStateView(snapshot);
      expect(constraint.test({ actorId: 1 } as any, view).kind).toBe("deny");
    });

    it("부대가 없으면 거절해야 함", () => {
      const constraint = new ReqTroopMembersConstraint();
      const g1 = mockGeneral(1, { troopId: 0 });
      const snapshot: WorldSnapshot = {
        generals: { 1: g1 },
        nations: {},
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
        generalTurns: {},
      };
      const view = new SnapshotStateView(snapshot);
      expect(constraint.test({ actorId: 1 } as any, view).kind).toBe("deny");
    });
  });
});
