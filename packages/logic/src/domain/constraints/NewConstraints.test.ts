import { describe, it, expect } from "vitest";
import { AllowDiplomacyWithTermConstraint } from "./AllowDiplomacyWithTermConstraint.js";
import { AllowJoinDestNationConstraint } from "./AllowJoinDestNationConstraint.js";
import { Diplomacy, General, Nation } from "../entities.js";
import { SnapshotStateView } from "../Command.js";

describe("NewConstraints", () => {
  describe("AllowDiplomacyWithTermConstraint", () => {
    it("상태와 기한이 모두 만족하면 통과해야 함", () => {
      const constraint = new AllowDiplomacyWithTermConstraint("2", 12, "조건 미달");
      const diplomacy: Diplomacy = {
        id: 1,
        srcNationId: 1,
        destNationId: 2,
        state: "2",
        term: 12,
        meta: {},
      };
      expect(constraint.checkDiplomacy(diplomacy).kind).toBe("allow");
    });

    it("상태가 다르면 실패해야 함", () => {
      const constraint = new AllowDiplomacyWithTermConstraint("2", 12, "조건 미달");
      const diplomacy: Diplomacy = {
        id: 1,
        srcNationId: 1,
        destNationId: 2,
        state: "1",
        term: 12,
        meta: {},
      };
      expect(constraint.checkDiplomacy(diplomacy).kind).toBe("deny");
    });

    it("기한이 부족하면 실패해야 함", () => {
      const constraint = new AllowDiplomacyWithTermConstraint("2", 12, "조건 미달");
      const diplomacy: Diplomacy = {
        id: 1,
        srcNationId: 1,
        destNationId: 2,
        state: "2",
        term: 11,
        meta: {},
      };
      expect(constraint.checkDiplomacy(diplomacy).kind).toBe("deny");
    });
  });

  describe("AllowJoinDestNationConstraint", () => {
    const mockGeneral = (overrides: Partial<General> = {}): General => ({
      id: 1,
      name: "G1",
      nationId: 0,
      cityId: 1,
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

    const mockNation = (overrides: Partial<Nation> = {}): Nation => ({
      id: 2,
      name: "N2",
      color: "",
      chiefGeneralId: 0,
      capitalCityId: 0,
      gold: 0,
      rice: 0,
      rate: 0,
      rateTmp: 0,
      tech: 0,
      power: 0,
      level: 1,
      gennum: 5,
      typeCode: "",
      scoutLevel: 0,
      strategicCmdLimit: 0,
      surrenderLimit: 0,
      spy: {},
      aux: {},
      meta: {},
      warState: 0,
      ...overrides,
    });

    it("정상 조건에서 통과해야 함", () => {
      const constraint = new AllowJoinDestNationConstraint(5);
      const view = new SnapshotStateView({
        generals: { 1: mockGeneral() },
        nations: { 2: mockNation() },
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
        generalTurns: {},
      });
      const ctx = { actorId: 1, args: { destNationId: 2 }, env: {}, mode: "full" as const };
      expect(constraint.test(ctx, view).kind).toBe("allow");
    });

    it("초반 장수 제한에 걸리면 실패해야 함", () => {
      const constraint = new AllowJoinDestNationConstraint(1);
      const view = new SnapshotStateView({
        generals: { 1: mockGeneral() },
        nations: { 2: mockNation({ gennum: 15 }) }, // initialNationGenLimit(10) 초과
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
        generalTurns: {},
      });
      const ctx = { actorId: 1, args: { destNationId: 2 }, env: {}, mode: "full" as const };
      const result = constraint.test(ctx, view);
      expect(result.kind).toBe("deny");
      if (result.kind === "deny") {
        expect(result.reason).toBe("임관이 제한되고 있습니다.");
      }
    });

    it("유저장이 태수국에 임관하려 하면 실패해야 함", () => {
      const constraint = new AllowJoinDestNationConstraint(5);
      const view = new SnapshotStateView({
        generals: { 1: mockGeneral({ npc: 0 }) },
        nations: { 2: mockNation({ name: "ⓤ태수국" }) },
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
        generalTurns: {},
      });
      const ctx = { actorId: 1, args: { destNationId: 2 }, env: {}, mode: "full" as const };
      const result = constraint.test(ctx, view);
      expect(result.kind).toBe("deny");
      if (result.kind === "deny") {
        expect(result.reason).toContain("태수국");
      }
    });
  });
});
