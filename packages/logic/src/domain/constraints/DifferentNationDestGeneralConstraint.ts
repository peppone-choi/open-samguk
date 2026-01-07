import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class DifferentNationDestGeneralConstraint implements Constraint {
  name = "DifferentNationDestGeneral";

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "destGeneral" as const, id: ctx.destGeneralId ?? 0 },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    const destGeneral = view.get({ kind: "destGeneral", id: ctx.destGeneralId ?? 0 });

    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (!destGeneral) {
      return { kind: "deny", reason: "대상 장수 정보를 찾을 수 없습니다." };
    }

    if (destGeneral.nationId !== general.nationId) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "같은 국가의 장수입니다." };
  }
}
