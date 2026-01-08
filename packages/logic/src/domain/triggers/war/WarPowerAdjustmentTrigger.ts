import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
} from "../../WarUnitTriggerRegistry.js";

export class WarPowerAdjustmentTrigger implements WarUnitTrigger {
  readonly name = "전투력보정";
  readonly priority: number;
  readonly raiseType: RaiseTypeValue = RaiseType.NONE;

  constructor(
    public readonly unit: WarUnit,
    priority: number,
    private readonly selfMultiplier: number,
    private readonly opposeMultiplier: number = 1.0
  ) {
    this.priority = priority;
  }

  attempt(_ctx: WarUnitTriggerContext): boolean {
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    if (this.selfMultiplier !== 1.0) ctx.self.multiplyWarPower(this.selfMultiplier);
    if (this.opposeMultiplier !== 1.0) ctx.oppose.multiplyWarPower(this.opposeMultiplier);
    return {
      delta: {},
      continueExecution: true,
    };
  }

  static selfOnly(unit: WarUnit, priority: number, multiplier: number): WarPowerAdjustmentTrigger {
    return new WarPowerAdjustmentTrigger(unit, priority, multiplier, 1.0);
  }

  static opposeOnly(
    unit: WarUnit,
    priority: number,
    multiplier: number
  ): WarPowerAdjustmentTrigger {
    return new WarPowerAdjustmentTrigger(unit, priority, 1.0, multiplier);
  }

  static both(
    unit: WarUnit,
    priority: number,
    selfMultiplier: number,
    opposeMultiplier: number
  ): WarPowerAdjustmentTrigger {
    return new WarPowerAdjustmentTrigger(unit, priority, selfMultiplier, opposeMultiplier);
  }
}
