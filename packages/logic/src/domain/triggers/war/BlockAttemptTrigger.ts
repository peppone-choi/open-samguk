import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";
import { WarStatHelper } from "../../WarStatHelper.js";

/**
 * 저지 시도 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_저지시도.php
 */
export class BlockAttemptTrigger implements WarUnitTrigger {
  readonly name = "저지시도";
  readonly priority = TriggerPriority.PRE;
  readonly raiseType: RaiseTypeValue;

  private readonly ratio: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number);

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE,
    ratio?: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number)
  ) {
    this.raiseType = raiseType;
    // 기본 확률: (atmos + train) / 400
    this.ratio = ratio ?? ((u) => (u.atmos + u.train) / 400);
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (ctx.isAttacker) {
      return false;
    }

    if (self.hasActivatedSkill("특수")) {
      return false;
    }

    if (self.hasActivatedSkill("저지불가")) {
      return false;
    }

    let prob = typeof this.ratio === "function" ? this.ratio(self, ctx) : this.ratio;

    // 아이템 보정 적용 (전투 저지 확률)
    prob = WarStatHelper.calcStat(self, "warBlockRatio", prob, { phase: ctx.phase });

    if (prob <= 0) return false;
    if (prob >= 1) return true;

    if (!ctx.rand.nextBool(prob)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    self.activateSkill("특수");
    self.activateSkill("저지");

    ctx.selfEnv["저지발동자"] = this.raiseType;

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 저지 시도!`],
        },
      },
      continueExecution: true,
    };
  }
}
