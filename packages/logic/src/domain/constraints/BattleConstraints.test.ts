import { describe, it, expect } from "vitest";
import { BattleGroundCityConstraint } from "./BattleGroundCityConstraint.js";
import { AllowRebellionConstraint } from "./AllowRebellionConstraint.js";
import { Diplomacy, General, Nation } from "../entities.js";
import { SnapshotStateView } from "../Command.js";

describe("BattleConstraints", () => {
  describe("BattleGroundCityConstraint", () => {
    it("교전 중인 상태('0')면 통과해야 함", () => {
      const constraint = new BattleGroundCityConstraint();
      const diplomacy: Diplomacy = {
        id: 1,
        srcNationId: 1,
        destNationId: 2,
        state: "0",
        term: 12,
        meta: {},
      };
      expect(constraint.checkDiplomacy(diplomacy).kind).toBe("allow");
    });

    it("교전 중이 아니면 실패해야 함", () => {
      const constraint = new BattleGroundCityConstraint();
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
  });

  describe("AllowRebellionConstraint", () => {
    const mockGeneral = (overrides: Partial<General> = {}): General => ({
      id: 1,
      name: "G1",
      nationId: 1,
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
      ...overrides,
    });

    const mockNation = (overrides: Partial<Nation> = {}): Nation => ({
      id: 1,
      name: "N1",
      color: "",
      chiefGeneralId: 2,
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

    it("군주가 비활동 중이고 유저장이면 통과해야 함", () => {
      const constraint = new AllowRebellionConstraint();
      const view = new SnapshotStateView({
        generals: {
          1: mockGeneral({ id: 1 }), // 액터
          2: mockGeneral({ id: 2, killTurn: 10, npc: 0 }), // 군주 (in env.killturn = 20)
        },
        nations: { 1: mockNation({ chiefGeneralId: 2 }) },
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
      });
      const ctx = {
        actorId: 1,
        nationId: 1,
        args: {},
        env: { killturn: 20 },
        mode: "full" as const,
      };
      expect(constraint.test(ctx, view).kind).toBe("allow");
    });

    it("액터가 이미 군주면 실패해야 함", () => {
      const constraint = new AllowRebellionConstraint();
      const view = new SnapshotStateView({
        generals: { 1: mockGeneral({ id: 1 }) },
        nations: { 1: mockNation({ chiefGeneralId: 1 }) },
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
      });
      const ctx = { actorId: 1, nationId: 1, args: {}, env: {}, mode: "full" as const };
      const result = constraint.test(ctx, view);
      expect(result.kind).toBe("deny");
      expect(result.reason).toBe("이미 군주입니다.");
    });

    it("군주가 활동 중이면 실패해야 함", () => {
      const constraint = new AllowRebellionConstraint();
      const view = new SnapshotStateView({
        generals: {
          1: mockGeneral({ id: 1 }),
          2: mockGeneral({ id: 2, killTurn: 25, npc: 0 }),
        },
        nations: { 1: mockNation({ chiefGeneralId: 2 }) },
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
      });
      const ctx = {
        actorId: 1,
        nationId: 1,
        args: {},
        env: { killturn: 20 },
        mode: "full" as const,
      };
      const result = constraint.test(ctx, view);
      expect(result.kind).toBe("deny");
      expect(result.reason).toBe("군주가 활동중입니다.");
    });

    it("군주가 NPC면 실패해야 함", () => {
      const constraint = new AllowRebellionConstraint();
      const view = new SnapshotStateView({
        generals: {
          1: mockGeneral({ id: 1 }),
          2: mockGeneral({ id: 2, killTurn: 10, npc: 2 }),
        },
        nations: { 1: mockNation({ chiefGeneralId: 2 }) },
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        gameTime: { year: 0, month: 0 },
        env: {},
      });
      const ctx = {
        actorId: 1,
        nationId: 1,
        args: {},
        env: { killturn: 20 },
        mode: "full" as const,
      };
      const result = constraint.test(ctx, view);
      expect(result.kind).toBe("deny");
      expect(result.reason).toBe("군주가 NPC입니다.");
    });
  });
});
