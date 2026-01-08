import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class BattleHealAttemptTrigger implements WarUnitTrigger {
  readonly name = "전투치료시도";
  readonly priority = TriggerPriority.PRE + 350;
  readonly raiseType: RaiseTypeValue;

  private readonly ratio: number;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE,
    ratio: number = 0.4
  ) {
    this.raiseType = raiseType;
    this.ratio = ratio;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (self.hasActivatedSkill("치료")) {
      return false;
    }

    if (self.hasActivatedSkill("치료불가")) {
      return false;
    }

    if (!ctx.rand.nextBool(this.ratio)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    self.activateSkill("치료");

    ctx.selfEnv["치료발동자"] = this.raiseType;

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 치료 시도!`],
        },
      },
      continueExecution: true,
    };
  }
}
