import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class IntimidationActivateTrigger implements WarUnitTrigger {
  readonly name = "위압발동";
  readonly priority = TriggerPriority.POST + 700;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (!self.hasActivatedSkill("위압")) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const oppose = ctx.oppose;

    oppose.multiplyWarPower(0);

    const isGeneralTarget = "general" in oppose;
    if (isGeneralTarget) {
      const currentAtmos = oppose.general.atmos;
      const newAtmos = Math.max(currentAtmos - 5, 40);

      return {
        delta: {
          generals: {
            [oppose.general.id]: { atmos: newAtmos },
          },
          logs: {
            global: [`상대가 위압을 받아 사기가 감소했다!`],
          },
        },
        continueExecution: true,
      };
    }

    return {
      delta: {
        logs: {
          global: [`상대가 위압을 받았다!`],
        },
      },
      continueExecution: true,
    };
  }
}
