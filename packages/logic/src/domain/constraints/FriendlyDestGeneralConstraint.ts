import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 대상 장수가 같은 국가 소속이어야 함
 * Legacy: FriendlyDestGeneral.php
 */
export class FriendlyDestGeneralConstraint implements Constraint {
  name = "FriendlyDestGeneral";

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

    if (general.nationId === destGeneral.nationId) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "아국 장수가 아닙니다." };
  }
}
