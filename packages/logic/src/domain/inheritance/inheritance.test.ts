/**
 * 유산 포인트 시스템 테스트
 * 레거시 sammo/InheritancePointManager.php 대응
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InheritanceKey } from "../enums/InheritanceKey.js";
import {
  InheritancePointManager,
  inheritancePointManager,
  INHERITANCE_POINT_TYPES,
} from "./InheritancePointManager.js";
import type { InheritanceContext, GeneralInheritanceData, InheritancePointValue } from "./types.js";

describe("InheritancePointManager", () => {
  let manager: InheritancePointManager;

  beforeEach(() => {
    manager = InheritancePointManager.getInstance();
  });

  describe("Singleton", () => {
    it("should return same instance", () => {
      const instance1 = InheritancePointManager.getInstance();
      const instance2 = InheritancePointManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should export singleton instance", () => {
      expect(inheritancePointManager).toBe(manager);
    });
  });

  describe("INHERITANCE_POINT_TYPES", () => {
    it("should have all InheritanceKey values", () => {
      const keys = Object.values(InheritanceKey);
      for (const key of keys) {
        expect(INHERITANCE_POINT_TYPES.has(key)).toBe(true);
      }
    });

    it("should have correct config for 'previous' key", () => {
      const config = INHERITANCE_POINT_TYPES.get(InheritanceKey.previous);
      expect(config).toEqual({
        storeType: true,
        pointCoeff: 1,
        info: "기존 보유",
        rebirthStoreCoeff: 1,
      });
    });

    it("should have correct config for 'dex' key", () => {
      const config = INHERITANCE_POINT_TYPES.get(InheritanceKey.dex);
      expect(config).toEqual({
        storeType: false,
        pointCoeff: 0.001,
        info: "숙련도",
        rebirthStoreCoeff: 0.5,
      });
    });

    it("should have correct config for 'combat' key (rank reference)", () => {
      const config = INHERITANCE_POINT_TYPES.get(InheritanceKey.combat);
      expect(config).toEqual({
        storeType: ["rank", "warnum"],
        pointCoeff: 5,
        info: "전투 횟수",
        rebirthStoreCoeff: 1,
      });
    });
  });

  describe("getInheritancePointType()", () => {
    it("should return config for valid key", () => {
      const config = manager.getInheritancePointType(InheritanceKey.previous);
      expect(config.storeType).toBe(true);
      expect(config.pointCoeff).toBe(1);
    });

    it("should throw for invalid key", () => {
      expect(() => {
        manager.getInheritancePointType("invalid" as InheritanceKey);
      }).toThrow("invalid는 유산 타입이 아님");
    });
  });

  describe("isDirectStoreType()", () => {
    it("should return true for direct store types", () => {
      expect(manager.isDirectStoreType(InheritanceKey.previous)).toBe(true);
      expect(manager.isDirectStoreType(InheritanceKey.lived_month)).toBe(true);
      expect(manager.isDirectStoreType(InheritanceKey.active_action)).toBe(true);
    });

    it("should return false for calculated types", () => {
      expect(manager.isDirectStoreType(InheritanceKey.dex)).toBe(false);
      expect(manager.isDirectStoreType(InheritanceKey.betting)).toBe(false);
      expect(manager.isDirectStoreType(InheritanceKey.max_belong)).toBe(false);
    });

    it("should return false for rank reference types", () => {
      expect(manager.isDirectStoreType(InheritanceKey.combat)).toBe(false);
      expect(manager.isDirectStoreType(InheritanceKey.sabotage)).toBe(false);
    });
  });

  describe("getInheritancePoint()", () => {
    const createContext = (isUnited = false): InheritanceContext => ({
      isUnited,
      year: 200,
      startYear: 184,
      month: 1,
    });

    const createGeneral = (
      overrides: Partial<GeneralInheritanceData> = {}
    ): GeneralInheritanceData => ({
      id: 1,
      ownerID: 100,
      npc: 0,
      belong: 5,
      dexValues: {
        footman: 10000,
        archer: 20000,
        cavalry: 30000,
        chariot: 5000,
        elephant: 1000,
        navy: 500,
      },
      rankData: {
        warnum: 100,
        firenum: 50,
        betwin: 10,
        betwingold: 5000,
        betgold: 10000,
      },
      aux: {},
      ...overrides,
    });

    describe("NPC handling", () => {
      it("should return 0 for NPC (npc >= 2)", () => {
        const general = createGeneral({ npc: 2 });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.previous, stored, ctx);
        expect(result.value).toBe(0);
      });

      it("should return 0 for no owner", () => {
        const general = createGeneral({ ownerID: null });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.previous, stored, ctx);
        expect(result.value).toBe(0);
      });
    });

    describe("Direct store types", () => {
      it("should return stored value for 'previous'", () => {
        const general = createGeneral();
        const stored = new Map<string, InheritancePointValue>([
          [InheritanceKey.previous, [500, null]],
        ]);
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.previous, stored, ctx);
        expect(result.value).toBe(500);
        expect(result.aux).toBe(null);
      });

      it("should return 0 if not stored", () => {
        const general = createGeneral();
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.previous, stored, ctx);
        expect(result.value).toBe(0);
      });
    });

    describe("Rank reference types", () => {
      it("should calculate 'combat' from rankData.warnum", () => {
        const general = createGeneral();
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.combat, stored, ctx);
        // warnum=100, coeff=5 => 500
        expect(result.value).toBe(500);
      });

      it("should calculate 'sabotage' from rankData.firenum", () => {
        const general = createGeneral();
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.sabotage, stored, ctx);
        // firenum=50, coeff=20 => 1000
        expect(result.value).toBe(1000);
      });
    });

    describe("Dex calculation", () => {
      it("should calculate dex points", () => {
        const general = createGeneral({
          dexValues: {
            footman: 10000,
            archer: 10000,
            cavalry: 10000,
            chariot: 10000,
            elephant: 10000,
            navy: 10000,
          },
        });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.dex, stored, ctx);
        // 60000 total * 0.001 = 60
        expect(result.value).toBe(60);
      });

      it("should apply 1/3 reduction for dex exceeding limit", () => {
        const general = createGeneral({
          dexValues: {
            footman: 150000, // 50000 over limit
            archer: 0,
            cavalry: 0,
            chariot: 0,
            elephant: 0,
            navy: 0,
          },
        });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.dex, stored, ctx);
        // 100000 + (50000/3) = 116666.67 * 0.001 = ~116.67
        expect(result.value).toBeCloseTo(116.667, 2);
      });
    });

    describe("Betting calculation", () => {
      it("should calculate betting points with win rate factor", () => {
        const general = createGeneral({
          rankData: {
            warnum: 0,
            firenum: 0,
            betwin: 10,
            betwingold: 5000,
            betgold: 10000,
          },
        });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.betting, stored, ctx);
        // betWin=10, coeff=10, winRate=0.5 => 10 * 10 * 0.25 = 25
        expect(result.value).toBe(25);
      });

      it("should use minimum bet gold for rate calculation", () => {
        const general = createGeneral({
          rankData: {
            warnum: 0,
            firenum: 0,
            betwin: 10,
            betwingold: 500,
            betgold: 500, // less than 1000 minimum
          },
        });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.betting, stored, ctx);
        // betWin=10, coeff=10, winRate=500/1000=0.5 => 10 * 10 * 0.25 = 25
        expect(result.value).toBe(25);
      });
    });

    describe("Max belong calculation", () => {
      it("should use current belong if higher", () => {
        const general = createGeneral({
          belong: 10,
          aux: { [InheritanceKey.max_belong]: 5 },
        });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.max_belong, stored, ctx);
        // max(10, 5) * 10 = 100
        expect(result.value).toBe(100);
      });

      it("should use stored max_belong if higher", () => {
        const general = createGeneral({
          belong: 5,
          aux: { [InheritanceKey.max_belong]: 10 },
        });
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext();

        const result = manager.getInheritancePoint(general, InheritanceKey.max_belong, stored, ctx);
        // max(5, 10) * 10 = 100
        expect(result.value).toBe(100);
      });
    });

    describe("United game state", () => {
      it("should return stored value when game is united", () => {
        const general = createGeneral();
        const stored = new Map<string, InheritancePointValue>([
          [InheritanceKey.combat, [999, null]],
        ]);
        const ctx = createContext(true); // isUnited = true

        const result = manager.getInheritancePoint(general, InheritanceKey.combat, stored, ctx);
        expect(result.value).toBe(999);
      });

      it("should return 0 for non-previous keys when united and not stored", () => {
        const general = createGeneral();
        const stored = new Map<string, InheritancePointValue>();
        const ctx = createContext(true);

        const result = manager.getInheritancePoint(general, InheritanceKey.combat, stored, ctx);
        expect(result.value).toBe(0);
      });
    });
  });

  describe("validateSetInheritancePoint()", () => {
    it("should allow setting direct store types", () => {
      const result = manager.validateSetInheritancePoint(InheritanceKey.previous, 100);
      expect(result.ok).toBe(true);
    });

    it("should reject non-direct store types", () => {
      const result = manager.validateSetInheritancePoint(InheritanceKey.dex, 100);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("직접 저장형 유산 포인트가 아님");
    });

    it("should reject non-1:1 coefficients with non-zero value", () => {
      const result = manager.validateSetInheritancePoint(InheritanceKey.active_action, 100);
      // active_action has coeff=3, not 1:1
      expect(result.ok).toBe(false);
      expect(result.error).toContain("1:1 유산 포인트가 아님");
    });

    it("should allow 0 value for any direct store type", () => {
      const result = manager.validateSetInheritancePoint(InheritanceKey.active_action, 0);
      expect(result.ok).toBe(true);
    });
  });

  describe("calculateIncreaseAmount()", () => {
    it("should apply coefficient to increase amount", () => {
      // active_action has coeff=3
      const amount = manager.calculateIncreaseAmount(InheritanceKey.active_action, 10);
      expect(amount).toBe(30);
    });

    it("should throw for non-direct store types", () => {
      expect(() => {
        manager.calculateIncreaseAmount(InheritanceKey.dex, 10);
      }).toThrow("직접 저장형 유산 포인트가 아님");
    });
  });

  describe("applyInheritancePoints()", () => {
    it("should return 0 for ownerID 0", () => {
      const result = manager.applyInheritancePoints(0, new Map());
      expect(result.totalPoint).toBe(0);
      expect(result.pointChanges).toHaveLength(0);
    });

    it("should return 0 for empty points", () => {
      const result = manager.applyInheritancePoints(100, new Map());
      expect(result.totalPoint).toBe(0);
      expect(result.pointChanges).toHaveLength(0);
    });

    it("should return previous point if only previous exists", () => {
      const points = new Map<string, InheritancePointValue>([
        [InheritanceKey.previous, [500, null]],
      ]);
      const result = manager.applyInheritancePoints(100, points);
      expect(result.totalPoint).toBe(500);
      expect(result.previousPoint).toBe(500);
      expect(result.pointChanges).toHaveLength(0);
    });

    it("should sum all points", () => {
      const points = new Map<string, InheritancePointValue>([
        [InheritanceKey.previous, [100, null]],
        [InheritanceKey.lived_month, [50, null]],
        [InheritanceKey.combat, [200, null]],
      ]);
      const result = manager.applyInheritancePoints(100, points);
      expect(result.totalPoint).toBe(350);
      expect(result.previousPoint).toBe(100);
      expect(result.pointChanges).toHaveLength(3);
    });

    it("should apply rebirth coefficient", () => {
      const points = new Map<string, InheritancePointValue>([
        [InheritanceKey.previous, [100, null]],
        [InheritanceKey.dex, [100, null]], // rebirthStoreCoeff = 0.5
      ]);
      const result = manager.applyInheritancePoints(100, points, true); // isRebirth = true
      // previous: 100 * 1 = 100, dex: 100 * 0.5 = 50
      expect(result.totalPoint).toBe(150);
    });

    it("should skip null rebirth coefficient keys on rebirth", () => {
      const points = new Map<string, InheritancePointValue>([
        [InheritanceKey.previous, [100, null]],
        [InheritanceKey.max_belong, [200, null]], // rebirthStoreCoeff = null
      ]);
      const result = manager.applyInheritancePoints(100, points, true);
      // max_belong should be skipped, only previous counted
      expect(result.totalPoint).toBe(100);
      expect(result.pointChanges).toHaveLength(1);
    });
  });

  describe("canMergeNPCInheritance()", () => {
    const createContext = (): InheritanceContext => ({
      isUnited: false,
      year: 200,
      startYear: 184,
      month: 1,
    });

    it("should return true for player characters (npc=0)", () => {
      const general: GeneralInheritanceData = {
        id: 1,
        ownerID: 100,
        npc: 0,
        belong: 5,
        dexValues: {},
        rankData: {},
        aux: {},
      };
      expect(manager.canMergeNPCInheritance(general, createContext(), false)).toBe(true);
    });

    it("should return false for npc=1 on rebirth", () => {
      const general: GeneralInheritanceData = {
        id: 1,
        ownerID: 100,
        npc: 1,
        belong: 5,
        dexValues: {},
        rankData: {},
        aux: {},
        pickYearMonth: 184 * 12 + 1,
      };
      expect(manager.canMergeNPCInheritance(general, createContext(), true)).toBe(false);
    });

    it("should return false if no pickYearMonth for npc=1", () => {
      const general: GeneralInheritanceData = {
        id: 1,
        ownerID: 100,
        npc: 1,
        belong: 5,
        dexValues: {},
        rankData: {},
        aux: {},
      };
      expect(manager.canMergeNPCInheritance(general, createContext(), false)).toBe(false);
    });

    it("should return true if NPC joined early enough", () => {
      const ctx = createContext(); // year=200, startYear=184, 16년 경과
      const general: GeneralInheritanceData = {
        id: 1,
        ownerID: 100,
        npc: 1,
        belong: 5,
        dexValues: {},
        rankData: {},
        aux: {},
        pickYearMonth: 186 * 12 + 1, // 186년에 등장, 14년 참여
      };
      // (200-186) * 2 = 28 > (200-184) = 16 => true
      expect(manager.canMergeNPCInheritance(general, ctx, false)).toBe(true);
    });

    it("should return false if NPC joined too late", () => {
      const ctx = createContext();
      const general: GeneralInheritanceData = {
        id: 1,
        ownerID: 100,
        npc: 1,
        belong: 5,
        dexValues: {},
        rankData: {},
        aux: {},
        pickYearMonth: 195 * 12 + 1, // 195년에 등장, 5년 참여
      };
      // (200-195) * 2 = 10 <= (200-184) = 16 => false
      expect(manager.canMergeNPCInheritance(general, ctx, false)).toBe(false);
    });
  });

  describe("needsClearance()", () => {
    it("should return false for empty map", () => {
      expect(manager.needsClearance(new Map())).toBe(false);
    });

    it("should return false if only previous exists", () => {
      const points = new Map<string, InheritancePointValue>([
        [InheritanceKey.previous, [100, null]],
      ]);
      expect(manager.needsClearance(points)).toBe(false);
    });

    it("should return true if other keys exist", () => {
      const points = new Map<string, InheritancePointValue>([
        [InheritanceKey.previous, [100, null]],
        [InheritanceKey.lived_month, [50, null]],
      ]);
      expect(manager.needsClearance(points)).toBe(true);
    });
  });

  describe("Key listing methods", () => {
    it("getAllKeys() should return all inheritance keys", () => {
      const keys = manager.getAllKeys();
      expect(keys).toContain(InheritanceKey.previous);
      expect(keys).toContain(InheritanceKey.dex);
      expect(keys).toContain(InheritanceKey.combat);
      expect(keys.length).toBe(Object.values(InheritanceKey).length);
    });

    it("getDirectStoreKeys() should only return direct store types", () => {
      const keys = manager.getDirectStoreKeys();
      expect(keys).toContain(InheritanceKey.previous);
      expect(keys).toContain(InheritanceKey.lived_month);
      expect(keys).not.toContain(InheritanceKey.dex);
      expect(keys).not.toContain(InheritanceKey.combat);
    });

    it("getCalculatedKeys() should only return calculated types", () => {
      const keys = manager.getCalculatedKeys();
      expect(keys).not.toContain(InheritanceKey.previous);
      expect(keys).toContain(InheritanceKey.dex);
      expect(keys).toContain(InheritanceKey.combat);
      expect(keys).toContain(InheritanceKey.betting);
    });
  });
});
