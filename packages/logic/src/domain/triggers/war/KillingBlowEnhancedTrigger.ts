import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 필살 강화 - 회피 불가 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_필살강화_회피불가.php
 *
 * - Priority: PRE + 150 (20150)
 * - 필살 스킬이 활성화되어 있으면 상대에게 '회피불가' 스킬 활성화
 * - 필살 적중 시 상대의 회피를 무효화
 */
export class KillingBlowEnhancedTrigger implements WarUnitTrigger {
  readonly name = "필살강화_회피불가";
  readonly priority = TriggerPriority.PRE + 150;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    // 필살이 활성화되어 있지 않으면 패스
    if (!self.hasActivatedSkill("필살")) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const oppose = ctx.oppose;

    // 상대에게 회피불가 스킬 활성화
    oppose.activateSkill("회피불가");

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
