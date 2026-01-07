import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class PreemptiveShotAttemptTrigger implements PriorityWarUnitTrigger {
  readonly name = "선제사격시도";
  readonly priority = TriggerPriority.BEGIN + 50;
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

    if (self.hasActivatedSkill("선제")) {
      return false;
    }

    if (self.hasActivatedSkillOnLog("선제")) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    self.activateSkill("특수");
    self.activateSkill("선제");

    ctx.selfEnv["선제발동자"] = this.raiseType;

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 선제 사격 시도!`],
        },
      },
      continueExecution: true,
    };
  }
}
