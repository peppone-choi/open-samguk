import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/**
 * 군주/수뇌부 제외 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqNotChief.php
 */
export class ReqNotChiefUnitConstraint implements GameUnitConstraint {
  test(ctx: GameUnitConstraintContext): boolean {
    return ctx.officerLevel < 5;
  }

  getInfo(): string {
    return "군주 및 수뇌부는 불가";
  }
}
