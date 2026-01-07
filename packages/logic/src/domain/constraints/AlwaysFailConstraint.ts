import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class AlwaysFailConstraint implements Constraint {
  name = "AlwaysFail";
  private reason: string;

  constructor(reason: string) {
    this.reason = reason;
  }

  requires(_ctx: ConstraintContext) {
    return [];
  }

  test(_ctx: ConstraintContext, _view: StateView): ConstraintResult {
    return { kind: "deny", reason: this.reason };
  }
}
