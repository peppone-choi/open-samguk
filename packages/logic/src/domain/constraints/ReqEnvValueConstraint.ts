import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

type CompareOp = ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==";

/**
 * 환경 변수(년도, 월 등) 조건 검사
 * 레거시: ReqEnvValue
 */
export class ReqEnvValueConstraint implements Constraint {
  name = "ReqEnvValue";

  /**
   * @param key 환경 변수 키 (예: 'year', 'month', 'startyear')
   * @param op 비교 연산자
   * @param value 비교 대상 값
   * @param errorMsg 실패 시 에러 메시지
   */
  constructor(
    private key: string,
    private op: CompareOp,
    private value: number,
    private errorMsg: string,
  ) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "env" as const, key: this.key }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const envValue = ctx.env[this.key];

    if (envValue === undefined) {
      return {
        kind: "deny",
        reason: `환경 변수 '${this.key}'가 설정되지 않았습니다.`,
      };
    }

    const pass = this.compare(envValue, this.op, this.value);

    if (!pass) {
      return { kind: "deny", reason: this.errorMsg };
    }

    return { kind: "allow" };
  }

  private compare(a: number, op: CompareOp, b: number): boolean {
    switch (op) {
      case ">":
        return a > b;
      case ">=":
        return a >= b;
      case "==":
        return a == b;
      case "<=":
        return a <= b;
      case "<":
        return a < b;
      case "!=":
        return a != b;
      case "===":
        return a === b;
      case "!==":
        return a !== b;
      default:
        return false;
    }
  }
}
