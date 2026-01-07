/**
 * 오석산(치료) - che_치료_오석산.php 포팅
 * [군사] 턴 실행 전 부상 회복. (영구)
 */
import { BaseItem } from "../BaseItem.js";

export class HealingPill2Item extends BaseItem {
  readonly code = "che_치료_오석산";
  readonly rawName = "오석산";
  readonly name = "오석산(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복.";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getPreTurnExecuteTriggerList 구현
  // new GeneralTrigger.che_아이템치료(general)

  isValidTurnItem(actionType: string, command: string): boolean {
    if (actionType === "GeneralTrigger" && command === "che_아이템치료") {
      return true;
    }
    return false;
  }
}

/**
 * 칠엽청점(치료) - che_치료_칠엽청점.php 포팅
 * [군사] 턴 실행 전 부상 회복. (영구)
 */
export class HealingPill3Item extends BaseItem {
  readonly code = "che_치료_칠엽청점";
  readonly rawName = "칠엽청점";
  readonly name = "칠엽청점(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복.";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getPreTurnExecuteTriggerList 구현
}

/**
 * 도소연명(치료) - che_치료_도소연명.php 포팅
 * [군사] 턴 실행 전 부상 50% 회복
 */
export class HealingBook1Item extends BaseItem {
  readonly code = "che_치료_도소연명";
  readonly rawName = "도소연명";
  readonly name = "도소연명(치료)";
  readonly info = "[군사] 턴 실행 전 부상 50% 회복";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getPreTurnExecuteTriggerList 구현
}

/**
 * 무후행군(치료) - che_치료_무후행군.php 포팅
 * [군사] 턴 실행 전 부상 80% 회복
 */
export class HealingBook2Item extends BaseItem {
  readonly code = "che_치료_무후행군";
  readonly rawName = "무후행군";
  readonly name = "무후행군(치료)";
  readonly info = "[군사] 턴 실행 전 부상 80% 회복";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getPreTurnExecuteTriggerList 구현
}
