import { type WarUnit, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 방어력 5% 증가 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_방어력증가5p.php
 *
 * - Priority: FINAL + 200 (50200)
 * - 수비 시 상대 전투력을 1/1.05 배로 감소 (실질적 방어력 5% 증가)
 */
export class DefenseBoost5pTrigger implements WarUnitTrigger {
  readonly name = "방어력증가5p";
  readonly priority = TriggerPriority.FINAL + 200;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  attempt(ctx: WarUnitTriggerContext): boolean {
    return !ctx.isAttacker;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    if (isWarUnit(ctx.oppose)) {
      ctx.oppose.multiplyWarPower(1 / 1.05);
    }

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
