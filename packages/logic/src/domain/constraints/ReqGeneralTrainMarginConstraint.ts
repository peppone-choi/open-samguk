import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class ReqGeneralTrainMarginConstraint implements Constraint {
  name = "ReqGeneralTrainMargin";
  private maxTrain: number;

  constructor(maxTrain: number) {
    this.maxTrain = maxTrain;
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });

    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.train < this.maxTrain) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "병사들은 이미 정예병사들입니다." };
  }
}
