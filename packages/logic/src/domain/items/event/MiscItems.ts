/**
 * 충차 - event_충차.php 포팅
 * [전투] 성벽 공격 시 대미지 +50%, 2회용
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { EventSiegeRamTrigger } from "../../triggers/war/EventSiegeRamTrigger.js";
import type { General } from "../../entities.js";
import type { RandUtil } from "@sammo/common";
import type { WarPowerMultiplier, WarUnitReadOnly, GeneralReadOnly, StatName } from "../types.js";

export class EventSiegeRamItem extends BaseItem {
  readonly code = "event_충차";
  readonly rawName = "충차";
  readonly name = "충차";
  readonly info = "[전투] 성벽 공격 시 대미지 +50%, 2회용";
  readonly type = "item" as const;
  readonly cost = 2000;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 3000;

  static readonly REMAIN_KEY = "remain충차";

  onArbitraryAction(
    general: General,
    _rng: RandUtil,
    actionType: string,
    phase?: string,
    aux?: any
  ): any {
    if (actionType !== "장비매매") return aux;
    if (phase !== "구매") return aux;

    if (general.meta) {
      general.meta[EventSiegeRamItem.REMAIN_KEY] = 2;
    }
    return aux;
  }

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const oppose = unit.oppose;
    if (oppose && "wall" in oppose) {
      return [1.5, 1];
    }
    return [1, 1];
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(new EventSiegeRamTrigger(unit));
  }
}

/**
 * 빼빼로 - event_빼빼로.php 포팅
 * 이벤트 아이템
 */
export class EventPepperoItem extends BaseItem {
  readonly code = "event_빼빼로";
  readonly rawName = "빼빼로";
  readonly name = "빼빼로";
  readonly info = "1의 상징입니다.\n통솔 +1, 무력 +1, 지력 +1";
  readonly type = "item" as const;
  readonly cost = 1500;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 12000;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    if (["leadership", "strength", "intel"].includes(statName)) {
      return value + 1;
    }
    return value;
  }
}

/**
 * 동작 - che_숙련_동작.php 포팅
 * 숙련도 획득량 +20%
 */
export class EventBronzeSparrowItem extends BaseItem {
  readonly code = "che_숙련_동작";
  readonly rawName = "동작";
  readonly name = "동작(숙련)";
  readonly info = "숙련도 획득량 +20%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    if (statName === "addDex") return value * 1.2;
    return value;
  }
}
