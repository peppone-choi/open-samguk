import { type WarUnit, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class RageAttemptTrigger implements WarUnitTrigger {
  readonly name = "격노시도";
  readonly priority = TriggerPriority.BODY + 400;
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

    // WarUnitCity doesn't have skills, so check if oppose is a WarUnit first
    if (!isWarUnit(oppose)) {
      return false;
    }

    if (!oppose.hasActivatedSkill("필살") && !oppose.hasActivatedSkill("회피")) {
      return false;
    }

    if (self.hasActivatedSkill("격노불가")) {
      return false;
    }

    const hasOpposeCritical = oppose.hasActivatedSkill("필살");

    if (hasOpposeCritical) {
      return true;
    }

    if (!ctx.rand.nextBool(0.25)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    self.activateSkill("격노");
    if (isWarUnit(oppose)) {
      oppose.deactivateSkill("회피");
    }

    ctx.selfEnv["격노발동자"] = this.raiseType;

    if (ctx.isAttacker && ctx.rand.nextBool(0.5)) {
      self.activateSkill("진노");
    }

    const logs: string[] = [`${self.general.name}의 격노!`];

    return {
      delta: {
        logs: { global: logs },
      },
      continueExecution: true,
    };
  }
}
