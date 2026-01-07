import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/**
 * 군주/수뇌부 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqChief.php
 */
export class ReqChiefUnitConstraint implements GameUnitConstraint {
  test(ctx: GameUnitConstraintContext): boolean {
    return ctx.officerLevel >= 5;
  }

  getInfo(): string {
    return "군주 및 수뇌부만 가능";
  }
}
