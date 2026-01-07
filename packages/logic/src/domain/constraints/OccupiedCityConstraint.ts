import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 현재 도시가 아국이어야 함 (city.nationId == general.nationId)
 * @param allowNeutral - true인 경우, 재야(nation == 0)도 허용
 */
export class OccupiedCityConstraint implements Constraint {
  name = "OccupiedCity";
  private allowNeutral: boolean;

  constructor(allowNeutral: boolean = false) {
    this.allowNeutral = allowNeutral;
  }

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "city" as const, id: ctx.cityId ?? 0 },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });

    if (!general || !city) {
      return { kind: "deny", reason: "정보를 찾을 수 없습니다." };
    }

    // 재야 허용 옵션이 켜져있고, 재야인 경우 통과
    if (this.allowNeutral && general.nationId === 0) {
      return { kind: "allow" };
    }

    if (city.nationId === general.nationId) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "아국이 아닙니다." };
  }
}
