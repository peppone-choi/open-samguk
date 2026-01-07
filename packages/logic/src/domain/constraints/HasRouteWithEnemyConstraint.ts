import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { MapUtil } from "../MapData.js";
import { WorldSnapshot } from "../entities.js";

/**
 * 자국령/공백지/교전중인국가령 을 거쳐 도달 가능한지 확인
 * 레거시: HasRouteWithEnemy.php
 */
export class HasRouteWithEnemyConstraint implements Constraint {
    name = "HasRouteWithEnemy";

    requires(ctx: ConstraintContext) {
        return [
            { kind: "general" as const, id: ctx.actorId },
            { kind: "city" as const, id: ctx.args.destCityId },
        ];
    }

    test(ctx: ConstraintContext, view: StateView): ConstraintResult {
        const snapshot = (view as any).snapshot as WorldSnapshot;
        if (!snapshot) {
            return { kind: "allow" };
        }

        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general) return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };

        const startingCityId = general.cityId;
        const destCityId = ctx.args.destCityId;
        const actorNationId = general.nationId;

        // 허용 국가 리스트 구성 (자국, 공백지, 교전중인 국가)
        const allowedNations = new Set<number>([actorNationId, 0]);

        // 교전중(state === "0")인 국가들 추가
        for (const dip of Object.values(snapshot.diplomacy)) {
            if (dip.srcNationId === actorNationId && dip.state === "0") {
                allowedNations.add(dip.destNationId);
            } else if (dip.destNationId === actorNationId && dip.state === "0") {
                allowedNations.add(dip.srcNationId);
            }
        }

        // 목적지 도시의 국가가 허용 국가에 포함되는지 먼저 체크 (레거시 logic)
        const destCity = snapshot.cities[destCityId];
        if (destCity && !allowedNations.has(destCity.nationId)) {
            return { kind: "deny", reason: "교전중인 국가가 아닙니다." };
        }

        const distance = MapUtil.getDistanceWithNation(
            startingCityId,
            destCityId,
            Array.from(allowedNations),
            snapshot
        );

        if (distance === undefined) {
            return { kind: "deny", reason: "경로에 도달할 방법이 없습니다." };
        }

        return { kind: "allow" };
    }
}
