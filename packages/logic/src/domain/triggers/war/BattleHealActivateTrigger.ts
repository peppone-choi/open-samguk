import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class BattleHealActivateTrigger implements WarUnitTrigger {
  readonly name = "전투치료발동";
  readonly priority = TriggerPriority.POST + 550;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (!self.hasActivatedSkill("치료")) {
      return false;
    }

    const healRaiseType = ctx.selfEnv["치료발동자"];
    if (healRaiseType !== this.raiseType) {
      return false;
    }

    if (ctx.selfEnv["치료발동"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    ctx.selfEnv["치료발동"] = true;

    oppose.multiplyWarPower(0.7);

    const logs: string[] = [`${self.general.name}이(가) 치료했다!`, `상대가 치료했다!`];

    const previousInjury = self.general.injury ?? 0;

    return {
      delta: {
        generals: {
          [self.general.id]: { injury: 0 },
        },
        logs: {
          global: previousInjury > 0 ? [...logs, `부상이 회복되었다!`] : logs,
        },
      },
      continueExecution: true,
    };
  }
}
