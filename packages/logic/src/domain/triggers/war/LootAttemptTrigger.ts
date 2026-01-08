import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class LootAttemptTrigger implements WarUnitTrigger {
  readonly name = "약탈시도";
  readonly priority = TriggerPriority.PRE + 400;
  readonly raiseType: RaiseTypeValue;

  private readonly ratio: number;
  private readonly theftRatio: number;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE,
    ratio: number = 0.3,
    theftRatio: number = 0.1
  ) {
    this.raiseType = raiseType;
    this.ratio = ratio;
    this.theftRatio = theftRatio;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;
    const oppose = ctx.oppose;

    if (self.phase !== 0 && oppose.phase !== 0) {
      return false;
    }

    const isGeneralTarget = "general" in oppose;
    if (!isGeneralTarget) {
      return false;
    }

    if (self.hasActivatedSkill("약탈")) {
      return false;
    }

    if (self.hasActivatedSkill("약탈불가")) {
      return false;
    }

    if (!ctx.rand.nextBool(this.ratio)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    self.activateSkill("약탈");
    ctx.selfEnv["theftRatio"] = this.theftRatio;

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 약탈 시도!`],
        },
      },
      continueExecution: true,
    };
  }
}
