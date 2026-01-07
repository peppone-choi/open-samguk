import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { JosaUtil } from "@sammo/common";

export class ReqCityCapacityConstraint implements Constraint {
  name = "ReqCityCapacity";
  private isPercent: boolean;
  private percentValue?: number;
  private numericValue?: number;

  constructor(
    private key: string,
    private keyNick: string,
    private reqVal: number | string
  ) {
    if (typeof reqVal === "string") {
      const percentMatch = reqVal.match(/^(\d+(?:\.\d+)?)%$/);
      if (percentMatch) {
        this.percentValue = parseFloat(percentMatch[1]) / 100;
        this.isPercent = true;
      } else {
        this.numericValue = parseFloat(reqVal);
        this.isPercent = false;
      }
    } else {
      this.numericValue = reqVal;
      this.isPercent = false;
    }
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "city" as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });

    if (!city) {
      return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
    }

    const targetValue = city[this.key];
    if (targetValue === undefined) {
      return {
        kind: "deny",
        reason: `도시 정보에 ${this.keyNick} 데이터가 없습니다.`,
      };
    }

    let requiredValue: number;
    if (this.isPercent && this.percentValue !== undefined) {
      const maxKey = `${this.key}Max`;
      const maxValue = city[maxKey];
      if (maxValue === undefined) {
        return {
          kind: "deny",
          reason: `도시 정보에 ${maxKey} 데이터가 없습니다.`,
        };
      }
      requiredValue = maxValue * this.percentValue;
    } else {
      requiredValue = this.numericValue ?? 0;
    }

    if (targetValue >= requiredValue) {
      return { kind: "allow" };
    }

    const josaYi = JosaUtil.pick(this.keyNick, "이");
    return { kind: "deny", reason: `${this.keyNick}${josaYi} 부족합니다.` };
  }
}
