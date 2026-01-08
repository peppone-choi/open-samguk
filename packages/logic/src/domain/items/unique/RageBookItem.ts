/**
 * 구정신단경(격노) - che_격노_구정신단경.php 포팅
 * [전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동,
 *        공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 5% 추가 중첩
 */
import { BaseItem } from "../BaseItem.js";
import type { WarPowerMultiplier, WarUnitReadOnly } from "../types.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { RageAttemptTrigger, RageActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

export class RageBookItem extends BaseItem {
  readonly code = "che_격노_구정신단경";
  readonly rawName = "구정신단경";
  readonly name = "구정신단경(격노)";
  readonly info =
    "[전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동, 공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 5% 추가 중첩";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    // 격노 활성화 횟수에 따라 공격력 증가
    const activatedCnt = unit.hasActivatedSkillOnLog("격노");
    return [1 + 0.05 * activatedCnt, 1];
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new RageAttemptTrigger(unit, RaiseType.ITEM),
      new RageActivateTrigger(unit, RaiseType.ITEM)
    );
  }
}
