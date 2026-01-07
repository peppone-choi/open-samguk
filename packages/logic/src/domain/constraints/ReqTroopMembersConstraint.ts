import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { WorldSnapshot } from "../entities.js";

/**
 * 부대원 존재 여부 확인
 * 레거시: ReqTroopMembers.php
 */
export class ReqTroopMembersConstraint implements Constraint {
    name = "ReqTroopMembers";

    requires(ctx: ConstraintContext) {
        return [{ kind: "general" as const, id: ctx.actorId }];
    }

    test(ctx: ConstraintContext, view: StateView): ConstraintResult {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general) return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };

        if (!general.troopId) {
            return { kind: "deny", reason: "소속된 부대가 없습니다." };
        }

        const snapshot = (view as any).snapshot as WorldSnapshot;
        if (!snapshot) {
            return { kind: "allow" };
        }

        // 부대에 본인 외의 다른 장수가 있는지 확인
        const members = Object.values(snapshot.generals).filter(
            (g) => g.troopId === general.troopId && g.id !== general.id
        );

        if (members.length > 0) {
            return { kind: "allow" };
        }

        return { kind: "deny", reason: "집합 가능한 부대원이 없습니다." };
    }
}
