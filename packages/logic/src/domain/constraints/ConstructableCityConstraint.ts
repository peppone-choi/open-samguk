import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class ConstructableCityConstraint implements Constraint {
  name = "ConstructableCity";

  requires(ctx: ConstraintContext) {
    return [{ kind: "city" as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });

    if (!city) {
      return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
    }

    if (city.nationId !== 0) {
      return { kind: "deny", reason: "공백지가 아닙니다." };
    }

    if (city.level !== 5 && city.level !== 6) {
      return { kind: "deny", reason: "중, 소 도시에만 가능합니다." };
    }

    return { kind: "allow" };
  }
}
