import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { MapUtil } from "../MapData.js";

/**
 * 대상 도시가 인접해야 함 (또는 지정된 거리 이내)
 * Legacy: NearCity.php
 */
export class NearCityConstraint implements Constraint {
  name = "NearCity";
  private distance: number;

  constructor(distance: number = 1) {
    this.distance = distance;
  }

  requires(ctx: ConstraintContext) {
    return [
      { kind: "city" as const, id: ctx.cityId ?? 0 },
      { kind: "destCity" as const, id: ctx.destCityId ?? 0 },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const cityId = ctx.cityId ?? 0;
    const destCityId = ctx.destCityId ?? 0;

    if (!destCityId) {
      return { kind: "deny", reason: "목적지 도시가 지정되지 않았습니다." };
    }

    if (cityId === destCityId) {
      return { kind: "deny", reason: "현재 도시와 목적지 도시가 같습니다." };
    }

    if (this.distance === 1) {
      if (!MapUtil.areAdjacent(cityId, destCityId)) {
        return { kind: "deny", reason: "인접한 도시가 아닙니다." };
      }
    } else {
      const dist = MapUtil.getDistance(cityId, destCityId);
      if (dist > this.distance) {
        return {
          kind: "deny",
          reason: `거리가 너무 멉니다. (현재: ${dist}, 최대: ${this.distance})`,
        };
      }
    }

    return { kind: "allow" };
  }
}
