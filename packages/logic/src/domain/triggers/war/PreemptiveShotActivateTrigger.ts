import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class PreemptiveShotActivateTrigger implements WarUnitTrigger {
  readonly name = "선제사격발동";
  readonly priority = TriggerPriority.BEGIN + 51;
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

    if (!self.hasActivatedSkill("선제")) {
      return false;
    }

    if (oppose.hasActivatedSkill("선제") && oppose.isAttacker) {
      return false;
    }

    const shotRaiseType = ctx.selfEnv["선제발동자"];
    if (shotRaiseType !== this.raiseType) {
      return false;
    }

    if (ctx.selfEnv["선제발동"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    ctx.selfEnv["선제발동"] = true;

    const logs: string[] = [];

    if (oppose.hasActivatedSkill("선제")) {
      self.multiplyWarPower(2 / 3);
      oppose.multiplyWarPower(2 / 3);
      logs.push(`서로 선제 사격을 주고 받았다!`);

      return {
        delta: {
          logs: { global: logs },
        },
        continueExecution: true,
      };
    }

    oppose.multiplyWarPower(0);
    self.multiplyWarPower(2 / 3);

    self.activateSkill("회피불가");
    self.activateSkill("필살불가");
    self.activateSkill("계략불가");

    oppose.activateSkill("회피불가");
    oppose.activateSkill("필살불가");
    oppose.activateSkill("격노불가");
    oppose.activateSkill("계략불가");

    logs.push(`${self.general.name}이(가) 상대에게 선제 사격을 했다!`);
    logs.push(`${oppose.general.name}이(가) 선제 사격을 받았다!`);

    return {
      delta: {
        logs: { global: logs },
      },
      continueExecution: true,
    };
  }
}
