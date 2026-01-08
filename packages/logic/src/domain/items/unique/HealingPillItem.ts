/**
 * 환약(치료) - che_치료_환약.php 포팅
 * [군사] 턴 실행 전 부상 회복. 3회용
 */
import { BaseItem } from "../BaseItem.js";
import { ItemHealTrigger } from "../../triggers/ItemHealTrigger.js";
import { Trigger } from "../../Trigger.js";
import { General } from "../../entities.js";
import { RandUtil } from "@sammo/common";

export class HealingPillItem extends BaseItem {
  readonly code = "che_치료_환약";
  readonly rawName = "환약";
  readonly name = "환약(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복. 3회용";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 0;

  static readonly REMAIN_KEY = "remain환약";

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    return new ItemHealTrigger();
  }

  onArbitraryAction(
    general: General,
    _rng: RandUtil,
    actionType: string,
    phase?: string,
    _aux?: unknown
  ): void {
    if (actionType === "장비매매" && phase === "구매") {
      if (general.meta) {
        general.meta[HealingPillItem.REMAIN_KEY] = 3;
      }
    }
  }

  tryConsumeNow(general: General, actionType: string, command: string): boolean {
    if (actionType !== "GeneralTrigger" || command !== "che_아이템치료") {
      return false;
    }

    const remainCnt = (general.meta?.[HealingPillItem.REMAIN_KEY] as number) ?? 1;
    if (remainCnt > 1) {
      if (general.meta) {
        general.meta[HealingPillItem.REMAIN_KEY] = remainCnt - 1;
      }
      return false;
    }

    if (general.meta) {
      delete general.meta[HealingPillItem.REMAIN_KEY];
    }
    return true;
  }
}
