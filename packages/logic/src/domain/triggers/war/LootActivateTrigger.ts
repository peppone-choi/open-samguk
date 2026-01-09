import { type WarUnit, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class LootActivateTrigger implements WarUnitTrigger {
  readonly name = "약탈발동";
  readonly priority = TriggerPriority.POST + 350;
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

    if (!self.hasActivatedSkill("약탈")) {
      return false;
    }

    if (ctx.selfEnv["약탈발동"]) {
      return false;
    }

    const isGeneralTarget = isWarUnit(oppose);
    if (!isGeneralTarget) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    ctx.selfEnv["약탈발동"] = true;

    // Only proceed if oppose is a WarUnit (attempt already checked this)
    if (!isWarUnit(oppose)) {
      return { delta: {}, continueExecution: true };
    }

    const theftRatio = ctx.selfEnv["theftRatio"] as number;

    const opposeGold = oppose.general.gold ?? 0;
    const opposeRice = oppose.general.rice ?? 0;

    const theftGold = Math.floor(opposeGold * theftRatio);
    const theftRice = Math.floor(opposeRice * theftRatio);

    const selfCurrentGold = self.general.gold ?? 0;
    const selfCurrentRice = self.general.rice ?? 0;

    return {
      delta: {
        generals: {
          [self.general.id]: {
            gold: selfCurrentGold + theftGold,
            rice: selfCurrentRice + theftRice,
          },
          [oppose.general.id]: {
            gold: Math.max(0, opposeGold - theftGold),
            rice: Math.max(0, opposeRice - theftRice),
          },
        },
        logs: {
          global: [
            `${self.general.name}이(가) 상대에게서 금 ${theftGold}, 쌀 ${theftRice}을(를) 약탈했다!`,
          ],
        },
      },
      continueExecution: true,
    };
  }
}
