/**
 * 정력견혈(치료) - che_치료_정력견혈.php 포팅
 * [군사] 턴 실행 전 부상 회복. (영구)
 */
import { BaseItem } from "../BaseItem.js";

export class HealingOintmentItem extends BaseItem {
  readonly code = "che_치료_정력견혈";
  readonly rawName = "정력견혈";
  readonly name = "정력견혈(치료)";
  readonly info = "[군사] 턴 실행 전 부상 회복.";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getPreTurnExecuteTriggerList 구현
  // new GeneralTrigger.che_아이템치료(general)
}
