import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/**
 * 항상 불가능한 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/Impossible.php
 */
export class ImpossibleUnitConstraint implements GameUnitConstraint {
  test(_ctx: GameUnitConstraintContext): boolean {
    return false;
  }

  getInfo(): string {
    return "불가능";
  }
}
