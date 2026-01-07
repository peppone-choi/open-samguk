import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/**
 * 특정 지역 소유 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqRegions.php
 */
export class ReqRegionsUnitConstraint implements GameUnitConstraint {
  private readonly reqRegions: Map<number, string>;

  /**
   * @param regions 지역 ID와 이름의 배열 [{ id: number, name: string }, ...]
   */
  constructor(regions: Array<{ id: number; name: string }>) {
    this.reqRegions = new Map(regions.map((r) => [r.id, r.name]));
  }

  test(ctx: GameUnitConstraintContext): boolean {
    if (this.reqRegions.size === 0) {
      return false;
    }

    for (const regionId of this.reqRegions.keys()) {
      if (ctx.ownRegions.has(regionId)) {
        return true;
      }
    }
    return false;
  }

  getInfo(): string {
    const regionNames = Array.from(this.reqRegions.values()).join(", ");
    return `${regionNames} 지역 소유시 가능`;
  }
}
