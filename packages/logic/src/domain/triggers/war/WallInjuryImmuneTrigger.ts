import type { WarUnit, WarUnitCity } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 성벽 부상 무효 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_성벽부상무효.php
 *
 * - Priority: BEGIN + 150 (10150)
 * - 상대가 성벽(WarUnitCity)일 경우 '부상무효' 스킬 활성화
 */
export class WallInjuryImmuneTrigger implements PriorityWarUnitTrigger {
  readonly name = "성벽부상무효";
  readonly priority = TriggerPriority.BEGIN + 150;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  private isWarUnitCity(unit: WarUnit | WarUnitCity): unit is WarUnitCity {
    return "wall" in unit && "def" in unit;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    return this.isWarUnitCity(ctx.oppose);
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    ctx.self.activateSkill("부상무효");

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
