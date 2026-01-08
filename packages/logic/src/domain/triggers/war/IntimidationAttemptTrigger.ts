import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class IntimidationAttemptTrigger implements WarUnitTrigger {
  readonly name = "위압시도";
  readonly priority = TriggerPriority.BEGIN + 100;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;
    const oppose = ctx.oppose;

    if (self.phase !== 0 && oppose.phase !== 0) {
      return false;
    }

    if (self.hasActivatedSkill("위압불가")) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    self.activateSkill("위압");
    oppose.activateSkill("회피불가");
    oppose.activateSkill("필살불가");
    oppose.activateSkill("계략불가");

    return {
      delta: {
        logs: {
          global: [`${self.general.name}이(가) 위압 발동!`],
        },
      },
      continueExecution: true,
    };
  }
}
