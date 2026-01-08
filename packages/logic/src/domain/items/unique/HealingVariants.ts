/**
 * 의술 관련 추가 아이템 (Healing variants)
 */
import { BaseItem } from "../BaseItem.js";
import { ItemHealTrigger } from "../../triggers/ItemHealTrigger.js";
import { Trigger } from "../../Trigger.js";
import { General } from "../../entities.js";

/** 도소연명(치료) */
export class HealingPill2Item extends BaseItem {
  readonly code = "che_치료_도소연명";
  readonly rawName = "도소연명";
  readonly name = "도소연명(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복.";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 10;

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    return new ItemHealTrigger();
  }
}

/** 무후행군(치료) */
export class HealingPill3Item extends BaseItem {
  readonly code = "che_치료_무후행군";
  readonly rawName = "무후행군";
  readonly name = "무후행군(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복.";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 10;

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    return new ItemHealTrigger();
  }
}

/** 오석산(치료) */
export class HealingPill4Item extends BaseItem {
  readonly code = "che_치료_오석산";
  readonly rawName = "오석산";
  readonly name = "오석산(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복.";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 10;

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    return new ItemHealTrigger();
  }
}

/** 칠엽청점(치료) */
export class HealingHerb1Item extends BaseItem {
  readonly code = "che_치료_칠엽청점";
  readonly rawName = "칠엽청점";
  readonly name = "칠엽청점(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복.";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 10;

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    return new ItemHealTrigger();
  }
}
