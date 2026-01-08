import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseTypeValue,
} from "../../WarUnitTriggerRegistry.js";

type Operator = "=" | "+" | "-" | "*" | "/";

export class StatChangeTrigger implements WarUnitTrigger {
  readonly name = "능력치변경";
  readonly priority: number;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    priority: number,
    raiseType: RaiseTypeValue,
    private readonly variable: string,
    private readonly operator: Operator,
    private readonly value: number,
    private readonly limitMin: number | null = null,
    private readonly limitMax: number | null = null
  ) {
    this.priority = priority;
    this.raiseType = raiseType;
  }

  attempt(_ctx: WarUnitTriggerContext): boolean {
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const warUnit = ctx.self as unknown as Record<string, number>;
    const currentValue = warUnit[this.variable] ?? 0;
    let newValue: number;

    switch (this.operator) {
      case "=":
        newValue = this.value;
        break;
      case "+":
        newValue = currentValue + this.value;
        break;
      case "-":
        newValue = currentValue - this.value;
        break;
      case "*":
        newValue = currentValue * this.value;
        break;
      case "/":
        newValue = this.value !== 0 ? currentValue / this.value : currentValue;
        break;
      default:
        throw new Error(`Invalid operator: ${this.operator}`);
    }

    if (this.limitMin !== null) newValue = Math.max(newValue, this.limitMin);
    if (this.limitMax !== null) newValue = Math.min(newValue, this.limitMax);
    warUnit[this.variable] = newValue;

    return {
      delta: {},
      continueExecution: true,
    };
  }

  static atmosChange(
    unit: WarUnit,
    priority: number,
    raiseType: RaiseTypeValue,
    operator: Operator,
    value: number
  ): StatChangeTrigger {
    return new StatChangeTrigger(unit, priority, raiseType, "atmos", operator, value, 0, 100);
  }

  static trainChange(
    unit: WarUnit,
    priority: number,
    raiseType: RaiseTypeValue,
    operator: Operator,
    value: number
  ): StatChangeTrigger {
    return new StatChangeTrigger(unit, priority, raiseType, "train", operator, value, 0, 100);
  }
}
