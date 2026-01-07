/**
 * 비급(격노) - event_전투특기_격노.php 포팅
 * [전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동,
 *        공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩
 */
import { BaseItem } from "../BaseItem.js";
import type { WarPowerMultiplier, WarUnitReadOnly } from "../types.js";

export class EventRageItem extends BaseItem {
  readonly code = "event_전투특기_격노";
  readonly rawName = "비급";
  readonly name = "비급(격노)";
  readonly info =
    "[전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동, 공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const activatedCnt = unit.hasActivatedSkillOnLog("격노");
    return [1 + 0.2 * activatedCnt, 1];
  }

  // TODO: getBattlePhaseSkillTriggerList
  // new che_격노시도(unit, TYPE_ITEM),
  // new che_격노발동(unit)
}

/**
 * 비급(필살) - event_전투특기_필살.php 포팅
 * [전투] 필살 확률 +30%p, 필살 발동시 대상 회피 불가, 필살 계수 향상
 */
import type { GeneralReadOnly, StatName } from "../types.js";

export class EventKillingBlowItem extends BaseItem {
  readonly code = "event_전투특기_필살";
  readonly rawName = "비급";
  readonly name = "비급(필살)";
  readonly info = "[전투] 필살 확률 +30%p, 필살 발동시 대상 회피 불가, 필살 계수 향상";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warCriticalRatio") {
      return value + 0.3;
    }
    if (statName === "criticalDamageRange") {
      const [rangeMin, rangeMax] = value as unknown as [number, number];
      return [(rangeMin + rangeMax) / 2, rangeMax] as unknown as number;
    }
    return value;
  }

  // TODO: getBattlePhaseSkillTriggerList
  // new che_필살강화_회피불가(unit)
}

/**
 * 비급(회피) - event_전투특기_신중.php 포팅
 * [전투] 회피 확률 +30%p
 */
export class EventEvasionItem extends BaseItem {
  readonly code = "event_전투특기_신중";
  readonly rawName = "비급";
  readonly name = "비급(회피)";
  readonly info = "[전투] 회피 확률 +30%p";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warAvoidRatio") {
      return value + 0.3;
    }
    return value;
  }
}

/**
 * 비급(반계) - event_전투특기_반계.php 포팅
 */
export class EventCounterItem extends BaseItem {
  readonly code = "event_전투특기_반계";
  readonly rawName = "비급";
  readonly name = "비급(반계)";
  readonly info = "[전투] 상대 계략 성공률 -15%p, 계략 되돌림 40%";
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
    if (statName === "warMagicSuccessProb") {
      return value - 0.15;
    }
    return value;
  }

  // TODO: getBattlePhaseSkillTriggerList
  // new che_반계시도(unit, TYPE_ITEM, 0.4),
  // new che_반계발동(unit)
}

/**
 * 비급(저격) - event_전투특기_저격.php 포팅
 */
export class EventSniperItem extends BaseItem {
  readonly code = "event_전투특기_저격";
  readonly rawName = "비급";
  readonly name = "비급(저격)";
  readonly info = "[전투] 새 상대와 전투 시 저격, 사기 +30";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  // TODO: getBattlePhaseSkillTriggerList
}

/**
 * 비급(위압) - event_전투특기_위압.php 포팅
 */
export class EventIntimidationItem extends BaseItem {
  readonly code = "event_전투특기_위압";
  readonly rawName = "비급";
  readonly name = "비급(위압)";
  readonly info = "[전투] 첫 페이즈 위압 발동";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  // TODO: getBattlePhaseSkillTriggerList
}

/**
 * 비급(의술) - event_전투특기_의술.php 포팅
 */
export class EventHealingItem extends BaseItem {
  readonly code = "event_전투특기_의술";
  readonly rawName = "비급";
  readonly name = "비급(의술)";
  readonly info = "[전투] 전투 치료 발동";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  // TODO: getBattlePhaseSkillTriggerList
}

/**
 * 비급(환술) - event_전투특기_환술.php 포팅
 */
export class EventIllusionItem extends BaseItem {
  readonly code = "event_전투특기_환술";
  readonly rawName = "비급";
  readonly name = "비급(환술)";
  readonly info = "[전투] 계략 성공 시 대미지 +30%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warMagicSuccessDamage") {
      return value * 1.3;
    }
    return value;
  }
}

/**
 * 비급(집중) - event_전투특기_집중.php 포팅
 */
export class EventConcentrationItem extends BaseItem {
  readonly code = "event_전투특기_집중";
  readonly rawName = "비급";
  readonly name = "비급(집중)";
  readonly info = "[전투] 계략 성공 시 대미지 +40%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warMagicSuccessDamage") {
      return value * 1.4;
    }
    return value;
  }
}

/**
 * 비급(척사) - event_전투특기_척사.php 포팅
 */
export class EventExorcismItem extends BaseItem {
  readonly code = "event_전투특기_척사";
  readonly rawName = "비급";
  readonly name = "비급(척사)";
  readonly info = "[전투] 지역/도시 병종 상대로 대미지 +20%, 피해 -20%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const oppose = unit.getOppose?.();
    if (oppose && "crewType" in oppose) {
      return [1.2, 0.8];
    }
    return [1, 1];
  }
}

/**
 * 비급(징병) - event_전투특기_징병.php 포팅
 */
export class EventRecruitmentItem extends BaseItem {
  readonly code = "event_전투특기_징병";
  readonly rawName = "비급";
  readonly name = "비급(징병)";
  readonly info = "[내정] 징병 효과 +30%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

/**
 * 비급(돌격) - event_전투특기_돌격.php 포팅
 */
export class EventChargeItem extends BaseItem {
  readonly code = "event_전투특기_돌격";
  readonly rawName = "비급";
  readonly name = "비급(돌격)";
  readonly info = "[전투] 돌격 효과";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

/**
 * 비급(무쌍) - event_전투특기_무쌍.php 포팅
 */
export class EventUnrivaledItem extends BaseItem {
  readonly code = "event_전투특기_무쌍";
  readonly rawName = "비급";
  readonly name = "비급(무쌍)";
  readonly info = "[전투] 무쌍 효과";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

/**
 * 비급(신산) - event_전투특기_신산.php 포팅
 */
export class EventDivineItem extends BaseItem {
  readonly code = "event_전투특기_신산";
  readonly rawName = "비급";
  readonly name = "비급(신산)";
  readonly info = "[전투] 신산 효과";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

/**
 * 비급(견고) - event_전투특기_견고.php 포팅
 */
export class EventFortifyItem extends BaseItem {
  readonly code = "event_전투특기_견고";
  readonly rawName = "비급";
  readonly name = "비급(견고)";
  readonly info = "[전투] 방어력 증가";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

/**
 * 비급(공성) - event_전투특기_공성.php 포팅
 */
export class EventSiegeItem extends BaseItem {
  readonly code = "event_전투특기_공성";
  readonly rawName = "비급";
  readonly name = "비급(공성)";
  readonly info = "[전투] 성벽 공격시 대미지 +50%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const oppose = unit.getOppose?.();
    if (oppose && "wall" in oppose) {
      return [1.5, 1];
    }
    return [1, 1];
  }
}

/**
 * 비급(보병/궁병/기병/귀병) - 병종 보너스
 */
export class EventInfantryItem extends BaseItem {
  readonly code = "event_전투특기_보병";
  readonly rawName = "비급";
  readonly name = "비급(보병)";
  readonly info = "[전투] 보병 사용시 대미지 +20%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

export class EventArcherItem extends BaseItem {
  readonly code = "event_전투특기_궁병";
  readonly rawName = "비급";
  readonly name = "비급(궁병)";
  readonly info = "[전투] 궁병 사용시 대미지 +20%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

export class EventCavalryItem extends BaseItem {
  readonly code = "event_전투특기_기병";
  readonly rawName = "비급";
  readonly name = "비급(기병)";
  readonly info = "[전투] 기병 사용시 대미지 +20%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}

export class EventGhostItem extends BaseItem {
  readonly code = "event_전투특기_귀병";
  readonly rawName = "비급";
  readonly name = "비급(귀병)";
  readonly info = "[전투] 귀병 사용시 대미지 +20%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 3000;
}
