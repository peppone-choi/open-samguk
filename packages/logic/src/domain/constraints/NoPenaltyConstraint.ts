import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class NoPenaltyConstraint implements Constraint {
  name = "NoPenalty";
  private penaltyKey: string;

  constructor(penaltyKey: string) {
    this.penaltyKey = penaltyKey;
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });

    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    const penaltyList = general.penalty ?? {};
    if (!(this.penaltyKey in penaltyList) || !penaltyList[this.penaltyKey]) {
      return { kind: "allow" };
    }

    return {
      kind: "deny",
      reason: `징계 사유: ${penaltyList[this.penaltyKey]}`,
    };
  }
}
