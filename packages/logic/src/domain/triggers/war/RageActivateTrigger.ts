import { type WarUnit, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

const DEFAULT_CRITICAL_DAMAGE = 2.0;

export class RageActivateTrigger implements WarUnitTrigger {
  readonly name = "격노발동";
  readonly priority = TriggerPriority.POST + 600;
  readonly raiseType: RaiseTypeValue;

  private readonly criticalDamageMultiplier: number;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE,
    criticalDamageMultiplier: number = DEFAULT_CRITICAL_DAMAGE
  ) {
    this.raiseType = raiseType;
    this.criticalDamageMultiplier = criticalDamageMultiplier;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (!self.hasActivatedSkill("격노")) {
      return false;
    }

    const rageRaiseType = ctx.selfEnv["격노발동자"];
    if (rageRaiseType !== this.raiseType) {
      return false;
    }

    if (ctx.selfEnv["격노발동"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    ctx.selfEnv["격노발동"] = true;

    const targetAct =
      isWarUnit(oppose) && oppose.hasActivatedSkill("필살") ? "필살 공격" : "회피 시도";
    const is진노 = self.hasActivatedSkill("진노");
    const reaction = is진노 ? "진노" : "격노";

    const logs: string[] = [
      `${self.general.name}이(가) 상대의 ${targetAct}에 ${reaction}했다!`,
      `${targetAct}에 상대가 ${reaction}했다!`,
    ];

    self.multiplyWarPower(this.criticalDamageMultiplier);

    return {
      delta: {
        logs: { global: logs },
      },
      continueExecution: true,
    };
  }
}
