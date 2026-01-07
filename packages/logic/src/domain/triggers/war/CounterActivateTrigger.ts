import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class CounterActivateTrigger implements PriorityWarUnitTrigger {
  readonly name = "반계발동";
  readonly priority = TriggerPriority.POST + 250;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (!self.hasActivatedSkill("반계")) {
      return false;
    }

    if (!ctx.opposeEnv["magic"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    const magic = ctx.opposeEnv["magic"] as [string, number];
    const [magicName, damage] = magic;

    self.multiplyWarPower(damage);

    return {
      delta: {
        logs: {
          global: [`${self.general.name}이(가) 반계로 상대의 ${magicName}을(를) 되돌렸다!`],
        },
      },
      continueExecution: true,
    };
  }
}
