import { type WarUnit, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class BlockActivateTrigger implements WarUnitTrigger {
  readonly name = "저지발동";
  readonly priority = TriggerPriority.POST;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (!self.hasActivatedSkill("저지")) {
      return false;
    }

    const blockRaiseType = ctx.selfEnv["저지발동자"];
    if (blockRaiseType !== this.raiseType) {
      return false;
    }

    if (ctx.selfEnv["저지발동"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    ctx.selfEnv["저지발동"] = true;

    self.multiplyWarPower(0);
    if (isWarUnit(oppose)) {
      oppose.multiplyWarPower(0);
    }

    const logs: string[] = [`${self.general.name}이(가) 상대를 저지했다!`];
    if (isWarUnit(oppose)) {
      logs.push(`${oppose.general.name}이(가) 저지당했다!`);
    }

    return {
      delta: {
        logs: { global: logs },
      },
      continueExecution: false,
    };
  }
}
