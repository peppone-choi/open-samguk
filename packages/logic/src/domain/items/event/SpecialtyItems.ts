/**
 * 비급 아이템 목록 (Specialty granting items)
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { WarActivateSkillsTrigger } from "../../triggers/war/WarActivateSkillsTrigger.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";
import type { WarPowerMultiplier, WarUnitReadOnly, GeneralReadOnly, StatName } from "../types.js";

/** 비급(격노) */
export class EventRageItem extends BaseItem {
  readonly code = "event_전투특기_격노";
  readonly rawName = "비급";
  readonly name = "비급(격노)";
  readonly info = "[전투] 격노 발동 허용 (상대 필살/회피 시도시 등)";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const activatedCnt = unit.hasActivatedSkillOnLog("격노");
    return [1 + 0.2 * activatedCnt, 1];
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["격노"])
    );
  }
}

/** 비급(필살) */
export class EventKillingBlowItem extends BaseItem {
  readonly code = "event_전투특기_필살";
  readonly rawName = "비급";
  readonly name = "비급(필살)";
  readonly info = "[전투] 필살 확률 +30%p, 필살 발동시 대상 회피 불가, 필살 계수 향상, 필살 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warCriticalRatio") return value + 0.3;
    if (statName === "criticalDamageRange") {
      const [rangeMin, rangeMax] = value as unknown as [number, number];
      return [(rangeMin + rangeMax) / 2, rangeMax] as unknown as number;
    }
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["필살"])
    );
  }
}

/** 비급(회피) */
export class EventEvasionItem extends BaseItem {
  readonly code = "event_전투특기_회피";
  readonly rawName = "비급";
  readonly name = "비급(회피)";
  readonly info = "[전투] 회피 확률 +30%p, 회피 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warAvoidRatio") return value + 0.3;
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["회피"])
    );
  }
}

/** 비급(반계) */
export class EventCounterItem extends BaseItem {
  readonly code = "event_전투특기_반계";
  readonly rawName = "비급";
  readonly name = "비급(반계)";
  readonly info = "[전투] 상대 계략 성공률 -15%p, 반계 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcOpposeStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    if (statName === "warMagicSuccessProb") return value - 0.15;
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["반계"])
    );
  }
}

/** 비급(저격) */
export class EventSniperItem extends BaseItem {
  readonly code = "event_전투특기_저격";
  readonly rawName = "비급";
  readonly name = "비급(저격)";
  readonly info = "[전투] 저격 허용, 사기 보정 +30";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    if (statName === "bonusAtmos") return value + 30;
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["저격"])
    );
  }
}

/** 비급(위압) */
export class EventIntimidationItem extends BaseItem {
  readonly code = "event_전투특기_위압";
  readonly rawName = "비급";
  readonly name = "비급(위압)";
  readonly info = "[전투] 위압 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["위압"])
    );
  }
}

/** 비급(의술) */
export class EventHealingItem extends BaseItem {
  readonly code = "event_전투특기_의술";
  readonly rawName = "비급";
  readonly name = "비급(의술)";
  readonly info = "[전투] 전투 치료 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["의술"])
    );
  }
}

/** 비급(전략/척사) */
export class EventExorcismItem extends BaseItem {
  readonly code = "event_전투특기_척사";
  readonly rawName = "비급";
  readonly name = "비급(척사)";
  readonly info = "[전투] 척사 허용, 지역/도시 병종 상대 대미지 +20%/피해-20%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const oppose = unit.oppose;
    if (oppose && "crewType" in oppose && (oppose as any).crewType >= 1000) {
      return [1.2, 0.8];
    }
    return [1, 1];
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["척사"])
    );
  }
}

/** 비급(돌격) */
export class EventChargeItem extends BaseItem {
  readonly code = "event_전투특기_돌격";
  readonly rawName = "비급";
  readonly name = "비급(돌격)";
  readonly info = "[전투] 돌격 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["돌격"])
    );
  }
}

/** 비급(무쌍) */
export class EventUnrivaledItem extends BaseItem {
  readonly code = "event_전투특기_무쌍";
  readonly rawName = "비급";
  readonly name = "비급(무쌍)";
  readonly info = "[전투] 무쌍 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["무쌍"])
    );
  }
}

/** 비급(신산) */
export class EventDivineItem extends BaseItem {
  readonly code = "event_전투특기_신산";
  readonly rawName = "비급";
  readonly name = "비급(신산)";
  readonly info = "[전투] 신산 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["신산"])
    );
  }
}

/** 비급(견고) */
export class EventFortifyItem extends BaseItem {
  readonly code = "event_전투특기_견고";
  readonly rawName = "비급";
  readonly name = "비급(견고)";
  readonly info = "[전투] 견고 허용, 방어력 보정 +10%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    if (statName === "defenseMultiplier") return value * 1.1;
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["견고"])
    );
  }
}

/** 비급(신중) - 레거시: 계략 성공 확률 100% */
export class EventPrudentItem extends BaseItem {
  readonly code = "event_전투특기_신중";
  readonly rawName = "비급";
  readonly name = "비급(신중)";
  readonly info = "[전투] 계략 성공 확률 100%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    // 레거시: warMagicSuccessProb += 1 (100% 성공률)
    if (statName === "warMagicSuccessProb") return value + 1;
    return value;
  }
}

/** 비급(집중) */
export class EventConcentrationItem extends BaseItem {
  readonly code = "event_전투특기_집중";
  readonly rawName = "비급";
  readonly name = "비급(집중)";
  readonly info = "[전투] 집중 허용, 계략 성공 시 대미지 +40%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    if (statName === "warMagicSuccessDamage") return value * 1.4;
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["집중"])
    );
  }
}

/** 비급(환술) */
export class EventIllusionItem extends BaseItem {
  readonly code = "event_전투특기_환술";
  readonly rawName = "비급";
  readonly name = "비급(환술)";
  readonly info = "[전투] 환술 허용, 계략 성공 시 대미지 +30%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    if (statName === "warMagicSuccessDamage") return value * 1.3;
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["환술"])
    );
  }
}

/** 비급(공성) */
export class EventSiegeItem extends BaseItem {
  readonly code = "event_전투특기_공성";
  readonly rawName = "비급";
  readonly name = "비급(공성)";
  readonly info = "[전투] 공성 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["공성"])
    );
  }
}

/** 비급(보병) */
export class EventInfantryItem extends BaseItem {
  readonly code = "event_전투특기_보병";
  readonly rawName = "비급";
  readonly name = "비급(보병)";
  readonly info = "[전투] 보병 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["보병"])
    );
  }
}

/** 비급(궁병) */
export class EventArcherItem extends BaseItem {
  readonly code = "event_전투특기_궁병";
  readonly rawName = "비급";
  readonly name = "비급(궁병)";
  readonly info = "[전투] 궁병 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["궁병"])
    );
  }
}

/** 비급(기병) */
export class EventCavalryItem extends BaseItem {
  readonly code = "event_전투특기_기병";
  readonly rawName = "비급";
  readonly name = "비급(기병)";
  readonly info = "[전투] 기병 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["기병"])
    );
  }
}

/** 비급(귀병) */
export class EventGhostItem extends BaseItem {
  readonly code = "event_전투특기_귀병";
  readonly rawName = "비급";
  readonly name = "비급(귀병)";
  readonly info = "[전투] 귀병 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["귀병"])
    );
  }
}

/** 비급(징병) */
export class EventRecruitmentItem extends BaseItem {
  readonly code = "event_전투특기_징병";
  readonly rawName = "비급";
  readonly name = "비급(징병)";
  readonly info = "[전투] 징병 허용";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["징병"])
    );
  }
}
