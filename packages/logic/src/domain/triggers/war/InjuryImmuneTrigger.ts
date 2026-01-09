import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 부상 무효 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_부상무효.php
 *
 * - Priority: BEGIN + 200 (10200)
 * - 전투 시작 시 '부상무효' 스킬 활성화
 */
export class InjuryImmuneTrigger implements WarUnitTrigger {
  readonly name = "부상무효";
  readonly priority = TriggerPriority.BEGIN + 200;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

  attempt(_ctx: WarUnitTriggerContext): boolean {
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    ctx.self.activateSkill("부상무효");

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
