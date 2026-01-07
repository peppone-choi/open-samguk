/**
 * 환약(치료) - che_치료_환약.php 포팅
 * [군사] 턴 실행 전 부상 회복. 3회용
 */
import { BaseItem } from "../BaseItem.js";
import type { General } from "../../entities.js";
import type { RandUtil } from "@sammo/common";

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

  // TODO: getPreTurnExecuteTriggerList 구현
  // new GeneralTrigger.che_아이템치료(general, general.getAuxVar('use_treatment') ?? 10)

  onArbitraryAction(
    general: General,
    _rng: RandUtil,
    actionType: string,
    phase?: string,
    aux?: any
  ): any {
    if (actionType !== "장비매매") return aux;
    if (phase !== "구매") return aux;

    // 구매 시 사용 횟수 3으로 초기화
    if (general.meta) {
      general.meta[HealingPillItem.REMAIN_KEY] = 3;
    }
    return aux;
  }

  tryConsumeNow(general: General, actionType: string, command: string): boolean {
    if (actionType !== "GeneralTrigger") return false;
    if (command !== "che_아이템치료") return false;

    const remainCnt = general.meta?.[HealingPillItem.REMAIN_KEY] ?? 1;
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
