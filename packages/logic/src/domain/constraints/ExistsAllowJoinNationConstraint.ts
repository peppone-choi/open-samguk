import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { GameConst } from "../GameConst.js";
import { Nation } from "../entities.js";

/**
 * 임관 가능 국가 존재 여부 확인
 * 레거시: ExistsAllowJoinNation.php
 */
export class ExistsAllowJoinNationConstraint implements Constraint {
    name = "ExistsAllowJoinNation";

    /**
     * @param relYear 상대 년도 (개전 후 경과 년수)
     * @param excludeList 제외할 국가 ID 목록
     */
    constructor(private relYear: number, private excludeList: number[]) { }

    requires(ctx: ConstraintContext) {
        return [{ kind: "general" as const, id: ctx.actorId }];
    }

    test(ctx: ConstraintContext, view: StateView): ConstraintResult {
        // 모든 국가를 순회해야 하므로 Command.run 에서 직접 처리 권장
        return { kind: "allow" };
    }

    /**
     * 모든 국가 목록을 받아서 임관 가능 국가가 있는지 확인
     */
    checkExists(nations: Record<number, Nation>): ConstraintResult {
        const genLimit = this.relYear < GameConst.openingPartYear
            ? GameConst.initialNationGenLimit
            : GameConst.defaultMaxGeneral;

        for (const nation of Object.values(nations)) {
            if (this.excludeList.includes(nation.id)) continue;

            // scoutLevel 0: 임관 허용, gennum: 장수 수 제한
            if (nation.scoutLevel === 0 && nation.gennum < genLimit) {
                return { kind: "allow" };
            }
        }

        return { kind: "deny", reason: "임관할 국가가 없습니다." };
    }
}
