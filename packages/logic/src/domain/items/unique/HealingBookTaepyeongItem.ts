/**
 * 태평청령(의술) - che_의술_태평청령.php 포팅
 * [군사] 매 턴마다 자신(100%)과 소속 도시 장수(아군만 15%) 부상 회복
 * [전투] 페이즈마다 25% 확률로 치료 발동
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { BattleHealAttemptTrigger, BattleHealActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";
import { CityHealTrigger } from "../../triggers/CityHealTrigger.js";
import { Trigger } from "../../Trigger.js";
import { General } from "../../entities.js";

export class HealingBookTaepyeongItem extends BaseItem {
  readonly code = "che_의술_태평청령";
  readonly rawName = "태평청령";
  readonly name = "태평청령(의술)";
  readonly info =
    "[군사] 매 턴마다 자신(100%)과 소속 도시 장수(아군만 15%) 부상 회복\n[전투] 페이즈마다 25% 확률로 치료 발동";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new BattleHealAttemptTrigger(unit, RaiseType.ITEM, 0.25),
      new BattleHealActivateTrigger(unit, RaiseType.ITEM)
    );
  }

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    return new CityHealTrigger("태평청령", 0.15, true);
  }
}
