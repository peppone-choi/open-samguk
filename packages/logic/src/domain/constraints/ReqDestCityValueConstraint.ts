import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

type Comparator = ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==";

/**
 * 범용 대상 도시 변수 검사 제약조건
 *
 * @example
 * new ReqDestCityValueConstraint('agri', '농업', '>=', 10000)
 * new ReqDestCityValueConstraint('def', '방어', '<', '80%') // 퍼센트 지원
 */
export class ReqDestCityValueConstraint implements Constraint {
  name = "ReqDestCityValue";
  private isPercent: boolean;
  private percentValue?: number;

  constructor(
    private key: string,
    private keyNick: string,
    private comp: Comparator,
    private reqVal: number | string,
    private errMsg?: string,
  ) {
    // 퍼센트 문자열 처리
    if (typeof reqVal === "string") {
      const percentMatch = reqVal.match(/^(\d+(?:\.\d+)?)%$/);
      if (percentMatch) {
        this.percentValue = parseFloat(percentMatch[1]) / 100;
        this.isPercent = true;
      } else {
        this.percentValue = parseFloat(reqVal);
        this.isPercent = !isNaN(this.percentValue);
      }
    } else {
      this.isPercent = false;
    }
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "destCity" as const, id: ctx.destCityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const destCity = view.get({ kind: "destCity", id: ctx.destCityId ?? 0 });

    if (!destCity) {
      return { kind: "deny", reason: "대상 도시 정보를 찾을 수 없습니다." };
    }

    const targetValue = destCity[this.key];
    if (targetValue === undefined) {
      return {
        kind: "deny",
        reason: `대상 도시 정보에 ${this.keyNick} 데이터가 없습니다.`,
      };
    }

    let requiredValue: number;
    if (this.isPercent && this.percentValue !== undefined) {
      const maxKey = `${this.key}Max`;
      const maxValue = destCity[maxKey];
      if (maxValue === undefined) {
        return {
          kind: "deny",
          reason: `대상 도시 정보에 ${maxKey} 데이터가 없습니다.`,
        };
      }
      requiredValue = maxValue * this.percentValue;
    } else {
      requiredValue =
        typeof this.reqVal === "number" ? this.reqVal : parseFloat(this.reqVal);
    }

    const result = this.compare(targetValue, requiredValue);

    if (result === true) {
      return { kind: "allow" };
    }

    if (this.errMsg) {
      return { kind: "deny", reason: this.errMsg };
    }

    return { kind: "deny", reason: `${this.keyNick}이(가) ${result}` };
  }

  private compare(target: any, required: number): true | string {
    switch (this.comp) {
      case "<":
        return target < required ? true : "너무 많습니다.";
      case "<=":
        return target <= required ? true : "너무 많습니다.";
      case "==":
        return target == required
          ? true
          : `올바르지 않은 ${this.keyNick} 입니다.`;
      case "!=":
        return target != required
          ? true
          : `올바르지 않은 ${this.keyNick} 입니다.`;
      case "===":
        return target === required
          ? true
          : `올바르지 않은 ${this.keyNick} 입니다.`;
      case "!==":
        return target !== required
          ? true
          : `올바르지 않은 ${this.keyNick} 입니다.`;
      case ">=":
        if (target >= required) return true;
        return required === 1 ? "없습니다" : "부족합니다.";
      case ">":
        if (target > required) return true;
        return required === 0 ? "없습니다" : "부족합니다.";
    }
  }
}
