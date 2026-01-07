import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class ReqGeneralAtmosMarginConstraint implements Constraint {
  name = "ReqGeneralAtmosMargin";
  private maxAtmos: number;

  constructor(maxAtmos: number) {
    this.maxAtmos = maxAtmos;
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });

    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.atmos < this.maxAtmos) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "이미 사기는 하늘을 찌를듯 합니다." };
  }
}
