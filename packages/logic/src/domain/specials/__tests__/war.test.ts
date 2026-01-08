import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { ChargeSpecial } from "../war/ChargeSpecial";
import { MasterMindSpecial } from "../war/MasterMindSpecial";
import { IllusionSpecial } from "../war/IllusionSpecial";
import { ConcentrationSpecial } from "../war/ConcentrationSpecial";
import { NoSpecialWar } from "../war/NoSpecialWar";
import type { General } from "../../entities";
import type { WarUnit } from "../types";

const mockGeneral: General = {
  id: 1,
  name: "유비",
  ownerId: 1,
  nationId: 1,
  cityId: 1,
  troopId: 0,
  gold: 100,
  rice: 100,
  leadership: 70,
  leadershipExp: 0,
  strength: 70,
  strengthExp: 0,
  intel: 70,
  intelExp: 0,
  politics: 70,
  politicsExp: 0,
  charm: 70,
  charmExp: 0,
  injury: 0,
  experience: 0,
  dedication: 0,
  officerLevel: 0,
  officerCity: 0,
  recentWar: 0,
  crew: 1000,
  crewType: 1,
  train: 50,
  atmos: 50,
  dex: {},
  age: 30,
  bornYear: 154,
  deadYear: 223,
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
  killTurn: 10,
  block: 0,
  defenceTrain: 0,
  tournamentState: 0,
  lastTurn: {},
  meta: {},
  penalty: {},
  npc: 0,
  startAge: 20,
  belong: 1,
  betray: 0,
  dedLevel: 0,
  expLevel: 0,
  officerLock: 0,
};

function createMockWarUnit(general: General): WarUnit {
  const activatedSkills = new Set<string>();
  return {
    general,
    crew: 1000,
    crewType: 1,
    train: 50,
    atmos: 50,
    dex: {},
    battleLog: [],
    rng: new RandUtil(new LiteHashDRBG("test-war-seed")),
    isAttacker: true,
    phase: 0,
    warPowerMultiplier: 1,
    activatedSkills,
    getGeneral: () => general,
    getOppose: () => undefined,
    hasActivatedSkillOnLog: () => 0,
    activateSkill: (skill: string) => activatedSkills.add(skill),
    deactivateSkill: (skill: string) => activatedSkills.delete(skill),
    hasActivatedSkill: (skill: string) => activatedSkills.has(skill),
    multiplyWarPower: () => {},
  };
}

describe("War Specials", () => {
  describe("ChargeSpecial (돌격)", () => {
    const special = new ChargeSpecial();

    it("should have correct id and name", () => {
      expect(special.id).toBe(60);
      expect(special.name).toBe("돌격");
    });

    it("should add +2 to initWarPhase", () => {
      const result = special.onCalcStat(mockGeneral, "initWarPhase", 3);
      expect(result).toBe(5);
    });

    it("should not modify other stats", () => {
      const result = special.onCalcStat(mockGeneral, "warMagicSuccessProb", 0.5);
      expect(result).toBe(0.5);
    });

    it("should return [1.05, 1] for war power multiplier", () => {
      const mockUnit = createMockWarUnit(mockGeneral);
      const result = special.getWarPowerMultiplier(mockUnit);
      expect(result).toEqual([1.05, 1]);
    });
  });

  describe("MasterMindSpecial (신산)", () => {
    const special = new MasterMindSpecial();

    it("should have correct id and name", () => {
      expect(special.id).toBe(41);
      expect(special.name).toBe("신산");
    });

    it("should add +0.1 to 계략 success on domestic", () => {
      const result = special.onCalcDomestic("계략", "success", 0.5);
      expect(result).toBeCloseTo(0.6);
    });

    it("should not modify other domestic turn types", () => {
      const result = special.onCalcDomestic("농업", "success", 0.5);
      expect(result).toBe(0.5);
    });

    it("should add +0.2 to warMagicTrialProb", () => {
      const result = special.onCalcStat(mockGeneral, "warMagicTrialProb", 0.3);
      expect(result).toBeCloseTo(0.5);
    });

    it("should add +0.2 to warMagicSuccessProb", () => {
      const result = special.onCalcStat(mockGeneral, "warMagicSuccessProb", 0.4);
      expect(result).toBeCloseTo(0.6);
    });

    it("should not modify other stats", () => {
      const result = special.onCalcStat(mockGeneral, "initWarPhase", 3);
      expect(result).toBe(3);
    });
  });

  describe("IllusionSpecial (환술)", () => {
    const special = new IllusionSpecial();

    it("should have correct id and name", () => {
      expect(special.id).toBe(42);
      expect(special.name).toBe("환술");
    });

    it("should add +0.1 to warMagicSuccessProb", () => {
      const result = special.onCalcStat(mockGeneral, "warMagicSuccessProb", 0.5);
      expect(result).toBeCloseTo(0.6);
    });

    it("should multiply warMagicSuccessDamage by 1.3", () => {
      const result = special.onCalcStat(mockGeneral, "warMagicSuccessDamage", 100);
      expect(result).toBe(130);
    });

    it("should not modify other stats", () => {
      const result = special.onCalcStat(mockGeneral, "initWarPhase", 3);
      expect(result).toBe(3);
    });
  });

  describe("ConcentrationSpecial (집중)", () => {
    const special = new ConcentrationSpecial();

    it("should have correct id and name", () => {
      expect(special.id).toBe(43);
      expect(special.name).toBe("집중");
    });

    it("should multiply warMagicSuccessDamage by 1.5", () => {
      const result = special.onCalcStat(mockGeneral, "warMagicSuccessDamage", 100);
      expect(result).toBe(150);
    });

    it("should not modify other stats", () => {
      const result = special.onCalcStat(mockGeneral, "warMagicSuccessProb", 0.5);
      expect(result).toBe(0.5);
    });
  });

  describe("NoSpecialWar", () => {
    const special = new NoSpecialWar();

    it("should have correct id and name", () => {
      expect(special.id).toBe(0);
      expect(special.name).toBe("-");
    });

    it("should not modify any values", () => {
      expect(special.onCalcStat(mockGeneral, "initWarPhase", 3)).toBe(3);
      expect(special.onCalcStat(mockGeneral, "warMagicSuccessProb", 0.5)).toBe(0.5);
    });

    it("should return [1, 1] for war power multiplier", () => {
      const mockUnit = createMockWarUnit(mockGeneral);
      const result = special.getWarPowerMultiplier(mockUnit);
      expect(result).toEqual([1, 1]);
    });
  });
});
