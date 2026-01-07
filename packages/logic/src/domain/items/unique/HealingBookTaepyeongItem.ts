/**
 * 태평청령(의술) - che_의술_태평청령.php 포팅
 * [군사] 매 턴마다 자신(100%)과 소속 도시 장수(적 포함 50%) 부상 회복
 * [전투] 페이즈마다 40% 확률로 치료 발동(아군 피해 30% 감소, 부상 회복)
 */
import { BaseItem } from "../BaseItem.js";

export class HealingBookTaepyeongItem extends BaseItem {
  readonly code = "che_의술_태평청령";
  readonly rawName = "태평청령";
  readonly name = "태평청령(의술)";
  readonly info =
    "[군사] 매 턴마다 자신(100%)과 소속 도시 장수(적 포함 50%) 부상 회복\n[전투] 페이즈마다 40% 확률로 치료 발동(아군 피해 30% 감소, 부상 회복)";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getPreTurnExecuteTriggerList 구현
  // new GeneralTrigger.che_도시치료(general)

  // TODO: getBattlePhaseSkillTriggerList 구현
  // new che_전투치료시도(unit, TYPE_ITEM + TYPE_DEDUP_TYPE_BASE * 303),
  // new che_전투치료발동(unit, TYPE_ITEM)
}
