import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 장수의 병력 여유분 확인
 * 레거시: ReqGeneralCrewMargin.php
 */
export class ReqGeneralCrewMarginConstraint implements Constraint {
    name = "ReqGeneralCrewMargin";

    constructor(private targetCrewType: number) { }

    requires(ctx: ConstraintContext) {
        return [{ kind: "general" as const, id: ctx.actorId }];
    }

    test(ctx: ConstraintContext, view: StateView): ConstraintResult {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general) return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };

        // 요청한 병종이 현재 병종과 다르면 무관 (병종 변경 시에는 무조건 여유가 있다고 가정하거나 0부터 시작하므로)
        // 레거시 logic: $reqCrewType->id != $generalObj->getCrewTypeObj()->id 이면 true 반환
        if (this.targetCrewType !== general.crewType) {
            return { kind: "allow" };
        }

        // 통솔 * 100 보다 현재 병력이 적어야 함
        if (general.leadership * 100 > general.crew) {
            return { kind: "allow" };
        }

        return { kind: "deny", reason: "이미 많은 병력을 보유하고 있습니다." };
    }
}
