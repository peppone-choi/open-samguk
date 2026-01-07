import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/**
 * 기술력 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqTech.php
 */
export class ReqTechUnitConstraint implements GameUnitConstraint {
  constructor(private readonly reqTech: number) {}

  test(ctx: GameUnitConstraintContext): boolean {
    return ctx.tech >= this.reqTech;
  }

  getInfo(): string {
    return `기술력 ${this.reqTech} 이상 필요`;
  }
}
