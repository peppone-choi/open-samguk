import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";
import { WarStatHelper } from "../../WarStatHelper.js";

/**
 * 필살 시도 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_필살시도.php
 */
export class KillingBlowAttemptTrigger implements WarUnitTrigger {
  readonly name = "필살시도";
  readonly priority = TriggerPriority.PRE + 120;
  readonly raiseType = RaiseType.NONE;

  private readonly criticalRatio: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number);

  constructor(
    public readonly unit: WarUnit,
    criticalRatio: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number) = 0.1
  ) {
    this.criticalRatio = criticalRatio;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (self.hasActivatedSkill("필살")) {
      return false;
    }

    if (self.hasActivatedSkill("필살불가")) {
      return false;
    }

    let prob =
      typeof this.criticalRatio === "function" ? this.criticalRatio(self, ctx) : this.criticalRatio;

    // 아이템 보정 적용 (전투 필살 확률)
    prob = WarStatHelper.calcStat(self, "warCriticalRatio", prob, { phase: ctx.phase });

    if (prob <= 0) return false;

    if (!ctx.rand.nextBool(prob)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    self.activateSkill("필살시도");
    self.activateSkill("필살");

    ctx.selfEnv["필살시도"] = true;

    if ("addBattleLog" in self) {
      (self as any).addBattleLog({
        phase: ctx.phase,
        type: "skill_attempt",
        skillName: "필살",
        activated: true,
      });
    }

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 필살 발동 준비!`],
        },
      },
      continueExecution: true,
    };
  }
}
