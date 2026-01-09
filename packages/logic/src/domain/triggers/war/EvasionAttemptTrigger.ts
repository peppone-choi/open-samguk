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
 * 회피 시도 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_회피시도.php
 */
export class EvasionAttemptTrigger implements WarUnitTrigger {
  readonly name = "회피시도";
  readonly priority = TriggerPriority.PRE + 200;
  readonly raiseType = RaiseType.NONE;

  private readonly avoidRatio: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number);

  constructor(
    public readonly unit: WarUnit,
    avoidRatio: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number) = 0.1
  ) {
    this.avoidRatio = avoidRatio;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (self.hasActivatedSkill("특수")) {
      return false;
    }

    if (self.hasActivatedSkill("회피불가")) {
      return false;
    }

    if (self.hasActivatedSkill("회피")) {
      return false;
    }

    let prob = typeof this.avoidRatio === "function" ? this.avoidRatio(self, ctx) : this.avoidRatio;

    // 아이템 보정 적용 (전투 회피 확률)
    prob = WarStatHelper.calcStat(self, "warAvoidRatio", prob, { phase: ctx.phase });

    if (prob <= 0) return false;

    if (!ctx.rand.nextBool(prob)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    self.activateSkill("회피시도");
    self.activateSkill("회피");

    ctx.selfEnv["회피시도"] = true;

    if ("addBattleLog" in self) {
      (self as any).addBattleLog({
        phase: ctx.phase,
        type: "skill_attempt",
        skillName: "회피",
        activated: true,
      });
    }

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 회피 준비!`],
        },
      },
      continueExecution: true,
    };
  }
}
