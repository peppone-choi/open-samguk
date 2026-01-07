/**
 * 삼황내문(저지) - che_저지_삼황내문.php 포팅
 * [전투] 수비 시 첫 페이즈 저지, 50% 확률로 2 페이즈 저지
 */
import { BaseItem } from "../BaseItem.js";

export class BlockBookItem extends BaseItem {
  readonly code = "che_저지_삼황내문";
  readonly rawName = "삼황내문";
  readonly name = "삼황내문(저지)";
  readonly info = "[전투] 수비 시 첫 페이즈 저지, 50% 확률로 2 페이즈 저지";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getBattlePhaseSkillTriggerList 구현
  // 조건: !unit.isAttacker() && phase === 0 && 저지 활성 횟수 < 2
  // 50% 확률로 2페이즈까지 저지
  // new WarActivateSkills(unit, TYPE_NONE, true, '특수', '저지'),
  // new che_저지발동(unit)
}
