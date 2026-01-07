import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { MapUtil } from "../MapData.js";
import { WorldSnapshot } from "../entities.js";

/**
 * 자국령을 거쳐 도달 가능한지 확인
 * 레거시: HasRoute.php
 */
export class HasRouteConstraint implements Constraint {
  name = "HasRoute";

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "city" as const, id: ctx.args.destCityId },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    // SnapshotStateView가 snapshot을 가지고 있다고 가정하고 형변환 시도
    const snapshot = (view as any).snapshot as WorldSnapshot;
    if (!snapshot) {
      // snapshot이 없으면 allow 반환 (Command.run에서 최종 확인 유도)
      return { kind: "allow" };
    }

    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };

    const startingCityId = general.cityId;
    const destCityId = ctx.args.destCityId;

    const distance = MapUtil.getDistanceWithNation(
      startingCityId,
      destCityId,
      [general.nationId],
      snapshot
    );

    if (distance === undefined) {
      return { kind: "deny", reason: "경로에 도달할 방법이 없습니다." };
    }

    return { kind: "allow" };
  }
}
