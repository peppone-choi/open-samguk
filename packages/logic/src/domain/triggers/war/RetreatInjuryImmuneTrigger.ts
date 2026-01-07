import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 퇴각 부상 무효 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_퇴각부상무효.php
 *
 * - Priority: BEGIN + 300 (10300)
 * - 전투 시작 시 '퇴각부상무효' 스킬 활성화
 */
export class RetreatInjuryImmuneTrigger implements PriorityWarUnitTrigger {
  readonly name = "퇴각부상무효";
  readonly priority = TriggerPriority.BEGIN + 300;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  attempt(_ctx: WarUnitTriggerContext): boolean {
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    ctx.self.activateSkill("퇴각부상무효");

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
