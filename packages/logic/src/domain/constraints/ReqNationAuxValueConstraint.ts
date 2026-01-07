import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

type Comparator = ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==";

export class ReqNationAuxValueConstraint implements Constraint {
  name = "ReqNationAuxValue";

  constructor(
    private key: string,
    private defaultValue: unknown,
    private comp: Comparator,
    private reqVal: unknown,
    private errMsg: string
  ) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });

    if (!nation) {
      return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };
    }

    const aux = nation.aux;
    if (aux === undefined || aux === null) {
      return { kind: "deny", reason: "국가 보조 데이터가 없습니다." };
    }

    const auxObj = typeof aux === "string" ? JSON.parse(aux) : aux;
    const targetValue = auxObj[this.key] ?? this.defaultValue;

    const result = this.compare(targetValue, this.reqVal);

    if (result) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: this.errMsg };
  }

  private compare(target: unknown, required: unknown): boolean {
    switch (this.comp) {
      case "<":
        return (target as number) < (required as number);
      case "<=":
        return (target as number) <= (required as number);
      case "==":
        return target == required;
      case "!=":
        return target != required;
      case "===":
        return target === required;
      case "!==":
        return target !== required;
      case ">=":
        return (target as number) >= (required as number);
      case ">":
        return (target as number) > (required as number);
      default:
        return false;
    }
  }
}
