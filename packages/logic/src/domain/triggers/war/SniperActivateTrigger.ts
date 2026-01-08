import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class SniperActivateTrigger implements WarUnitTrigger {
  readonly name = "저격발동";
  readonly priority = TriggerPriority.POST + 100;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (!self.hasActivatedSkill("저격")) {
      return false;
    }

    const sniperRaiseType = ctx.selfEnv["저격발동자"];
    if (sniperRaiseType !== this.raiseType) {
      return false;
    }

    if (ctx.selfEnv["저격발동"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    ctx.selfEnv["저격발동"] = true;

    const woundMin = ctx.selfEnv["woundMin"] as number;
    const woundMax = ctx.selfEnv["woundMax"] as number;
    const addAtmos = ctx.selfEnv["addAtmos"] as number;

    const logs: string[] = [];
    const isGeneralTarget = "general" in oppose;

    if (isGeneralTarget) {
      logs.push(`${self.general.name}이(가) 상대를 저격했다!`);
    } else {
      logs.push(`${self.general.name}이(가) 성벽 수비대장을 저격했다!`);
    }

    const atmosBefore = self.general.atmos;
    const MAX_ATMOS_BY_WAR = 150;
    const newAtmos = Math.min(atmosBefore + addAtmos, MAX_ATMOS_BY_WAR);

    let wound = 0;
    if (isGeneralTarget && !oppose.hasActivatedSkill("부상무효")) {
      wound = ctx.rand.nextRangeInt(woundMin, woundMax);
      const currentInjury = oppose.general.injury ?? 0;
      const newInjury = Math.min(currentInjury + wound, 80);
      logs.push(`상대에게 ${wound} 부상!`);

      return {
        delta: {
          generals: {
            [self.general.id]: { atmos: newAtmos },
            [oppose.general.id]: { injury: newInjury },
          },
          logs: { global: logs },
        },
        continueExecution: true,
      };
    }

    return {
      delta: {
        generals: {
          [self.general.id]: { atmos: newAtmos },
        },
        logs: { global: logs },
      },
      continueExecution: true,
    };
  }
}
