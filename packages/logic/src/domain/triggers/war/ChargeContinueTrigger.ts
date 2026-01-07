import type { WarUnit, WarUnitCity } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 돌격 지속 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_돌격지속.php
 *
 * - Priority: POST + 900 (40900)
 * - 공격 시 병종 상성이 유리하면 추가 페이즈 획득
 * - 불리하면 상대가 선제 있을 때 페이즈 감소
 */
export class ChargeContinueTrigger implements PriorityWarUnitTrigger {
  readonly name = "돌격지속";
  readonly priority = TriggerPriority.POST + 900;
  readonly raiseType = RaiseType.NONE;

  private readonly attackCoefThreshold: number;
  private readonly maxPhase: number;

  constructor(
    public readonly unit: WarUnit,
    attackCoefThreshold: number = 1,
    maxPhase: number = 5
  ) {
    this.attackCoefThreshold = attackCoefThreshold;
    this.maxPhase = maxPhase;
  }

  private isWarUnitCity(unit: WarUnit | WarUnitCity): unit is WarUnitCity {
    return "wall" in unit && "def" in unit;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    if (this.isWarUnitCity(ctx.oppose)) {
      return false;
    }
    if (!ctx.isAttacker) {
      return false;
    }
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    const attackCoef = ctx.selfEnv["attackCoef"] as number | undefined;

    if (attackCoef !== undefined && attackCoef < this.attackCoefThreshold) {
      if (oppose.hasActivatedSkill("선제") && self.phase >= this.maxPhase - 2) {
        ctx.selfEnv["bonusPhase"] = ((ctx.selfEnv["bonusPhase"] as number) || 0) - 1;
      }
      return {
        delta: {},
        continueExecution: true,
      };
    }

    if (self.phase < this.maxPhase - 1) {
      return {
        delta: {},
        continueExecution: true,
      };
    }

    ctx.selfEnv["bonusPhase"] = ((ctx.selfEnv["bonusPhase"] as number) || 0) + 1;

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
