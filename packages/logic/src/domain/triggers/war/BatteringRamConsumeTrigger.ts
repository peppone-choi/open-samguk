import { type WarUnit, type WarUnitCity, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
} from "../../WarUnitTriggerRegistry.js";

export class BatteringRamConsumeTrigger implements WarUnitTrigger {
  readonly name = "충차아이템소모";
  readonly priority: number;
  readonly raiseType: RaiseTypeValue;
  private static readonly REMAIN_KEY = "remain충차";

  constructor(
    public readonly unit: WarUnit,
    priority: number,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.priority = priority;
    this.raiseType = raiseType;
  }

  private isWallUnit(warUnit: WarUnit | WarUnitCity): boolean {
    return !isWarUnit(warUnit);
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    if (!this.isWallUnit(ctx.oppose)) return false;
    if (ctx.self.hasActivatedSkill("충차공격")) return false;
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const logs: string[] = [];
    ctx.self.activateSkill("충차공격");
    logs.push("충차로 성벽을 공격합니다!");

    const selfAux = ctx.selfEnv as Record<string, number>;
    const remain = selfAux[BatteringRamConsumeTrigger.REMAIN_KEY] ?? 0;
    selfAux[BatteringRamConsumeTrigger.REMAIN_KEY] = Math.max(0, remain - 1);
    if (selfAux[BatteringRamConsumeTrigger.REMAIN_KEY] <= 0) {
      logs.push("충차가 소모되었습니다.");
    }

    return {
      delta: { logs: { global: logs } },
      continueExecution: true,
    };
  }
}
