import { type WarUnit, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class CounterAttemptTrigger implements WarUnitTrigger {
  readonly name = "반계시도";
  readonly priority = TriggerPriority.BODY + 300;
  readonly raiseType: RaiseTypeValue;

  private readonly prob: number;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE,
    prob: number = 0.4
  ) {
    this.raiseType = raiseType;
    this.prob = prob;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;
    const oppose = ctx.oppose;

    if (!isWarUnit(oppose)) {
      return false;
    }

    if (!oppose.hasActivatedSkill("계략")) {
      return false;
    }

    if (self.hasActivatedSkill("반계불가")) {
      return false;
    }

    if (!ctx.rand.nextBool(this.prob)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    self.activateSkill("반계");
    if (isWarUnit(oppose)) {
      oppose.deactivateSkill("계략");
    }

    return {
      delta: {
        logs: {
          global: [`${self.general.name}이(가) 반계 시도!`],
        },
      },
      continueExecution: true,
    };
  }
}
