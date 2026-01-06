import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

type Comparator = ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==";

/**
 * 범용 장수 변수 검사 제약조건
 *
 * @example
 * new ReqGeneralValueConstraint('leadership', '통솔', '>=', 80)
 * new ReqGeneralValueConstraint('gold', '자금', '>=', 1000, '자금이 부족합니다.')
 */
export class ReqGeneralValueConstraint implements Constraint {
  name = "ReqGeneralValue";

  constructor(
    private key: string,
    private keyNick: string,
    private comp: Comparator,
    private reqVal: number,
    private errMsg?: string,
  ) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });

    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    const targetValue = general[this.key];
    if (targetValue === undefined) {
      return {
        kind: "deny",
        reason: `장수 정보에 ${this.keyNick} 데이터가 없습니다.`,
      };
    }

    const result = this.compare(targetValue, this.reqVal);

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
