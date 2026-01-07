import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 장수 병력이 있어야 함
 */
export class ReqGeneralCrewConstraint implements Constraint {
  name = "ReqGeneralCrew";
  private minCrew: number;

  constructor(minCrew: number = 1) {
    this.minCrew = minCrew;
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.crew >= this.minCrew) {
      return { kind: "allow" };
    }

    if (this.minCrew === 1) {
      return { kind: "deny", reason: "병사가 없습니다." };
    }

    return {
      kind: "deny",
      reason: `병력이 부족합니다. (필요: ${this.minCrew}, 보유: ${general.crew})`,
    };
  }
}
