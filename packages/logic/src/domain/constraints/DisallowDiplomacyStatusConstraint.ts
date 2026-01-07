import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { Diplomacy } from "../entities.js";

/**
 * 특정 외교 상태 중 하나라도 포함되면 안 됨
 * 레거시: DisallowDiplomacyStatus.php
 */
export class DisallowDiplomacyStatusConstraint implements Constraint {
    name = "DisallowDiplomacyStatus";

    /**
     * @param disallowStatus 금지되는 외교 상태와 그에 따른 에러 메시지 맵
     */
    constructor(private disallowStatus: Record<string, string>) { }

    requires(ctx: ConstraintContext) {
        return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
    }

    test(ctx: ConstraintContext, view: StateView): ConstraintResult {
        // 외교 상태 검사는 WorldSnapshot.diplomacy 직접 접근 필요
        // StateView는 diplomacy 접근 미지원 -> Command.run에서 직접 검사 필요
        return { kind: "allow" };
    }

    /**
     * 외부에서 직접 호출할 수 있는 검사 함수
     */
    checkDiplomacy(diplomacyList: Diplomacy[]): ConstraintResult {
        for (const dip of diplomacyList) {
            if (this.disallowStatus[dip.state]) {
                return { kind: "deny", reason: this.disallowStatus[dip.state] };
            }
        }

        return { kind: "allow" };
    }

    getDisallowStatus(): Record<string, string> {
        return this.disallowStatus;
    }
}
