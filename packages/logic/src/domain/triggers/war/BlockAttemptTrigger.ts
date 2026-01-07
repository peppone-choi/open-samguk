import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class BlockAttemptTrigger implements PriorityWarUnitTrigger {
  readonly name = "저지시도";
  readonly priority = TriggerPriority.PRE;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
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

    const ratio = (self.atmos + self.train) / 400;
    if (!ctx.rand.nextBool(ratio)) {
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
