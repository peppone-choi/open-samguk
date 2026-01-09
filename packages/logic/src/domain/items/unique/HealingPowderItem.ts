/**
 * 정력견혈산(의술) - che_의술_정력견혈산.php 포팅
 * [군사] 매 턴마다 자신(80%) 부상 회복
 */
import { BaseItem } from "../BaseItem.js";
import { CityHealTrigger } from "../../triggers/CityHealTrigger.js";
import { Trigger } from "../../Trigger.js";
import { General } from "../../entities.js";

export class HealingPowderItem extends BaseItem {
  readonly code = "che_의술_정력견혈산";
  readonly rawName = "정력견혈산";
  readonly name = "정력견혈산(의술)";
  readonly info = "[군사] 매 턴마다 자신(80%) 부상 회복";
  readonly type = "item" as const;
  readonly cost = 150;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    // 본인은 100%, 타인은 80%?
    // 레거시 che_의술_정력견혈산.php를 보면 CityHealTrigger 80% 일 확률이 높음.
    return new CityHealTrigger("정력견혈산", 0.8, false);
  }
}
