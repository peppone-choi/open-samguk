import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 임의의 콜백 함수를 사용한 제약 조건
 * 레거시: AdhocCallback.php
 */
export class AdhocCallbackConstraint implements Constraint {
    name = "AdhocCallback";

    constructor(private callback: (ctx: ConstraintContext, view: StateView) => string | null) { }

    requires(ctx: ConstraintContext) {
        // 콜백이 무엇을 필요로 할지 알 수 없으므로 보수적으로 빈 배열 반환
        // 실제 사용 시에는 필요한 요구사항을 미리 context 등에 채워넣어야 함
        return [];
    }

    test(ctx: ConstraintContext, view: StateView): ConstraintResult {
        const reason = this.callback(ctx, view);
        if (reason === null) {
            return { kind: "allow" };
        }
        return { kind: "deny", reason };
    }
}
