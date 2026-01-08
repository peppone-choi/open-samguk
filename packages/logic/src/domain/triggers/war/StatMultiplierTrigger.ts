import type { WarUnit } from "../../specials/types.js";
import {
    WarUnitTrigger,
    WarUnitTriggerContext,
    WarUnitTriggerResult,
    RaiseType,
    RaiseTypeValue,
    TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 단순 전투력 배율 보정 트리거
 * 아이템이나 특기 등에 의한 상시 또는 특정 조건부 배율 적용 시 사용
 */
export class StatMultiplierTrigger implements WarUnitTrigger {
    readonly name = "전투력보정";
    readonly priority = TriggerPriority.PRE - 100; // 계산 전 미리 적용
    readonly raiseType: RaiseTypeValue;

    constructor(
        public readonly unit: WarUnit,
        private readonly multiplier: (unit: WarUnit, ctx: WarUnitTriggerContext) => [number, number],
        raiseType: RaiseTypeValue = RaiseType.NONE
    ) {
        this.raiseType = raiseType;
    }

    attempt(_ctx: WarUnitTriggerContext): boolean {
        return true;
    }

    actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
        const [attMult, defMult] = this.multiplier(this.unit, ctx);

        if (this.unit.isAttacker) {
            if (attMult !== 1) this.unit.multiplyWarPower(attMult);
        } else {
            if (defMult !== 1) this.unit.multiplyWarPower(defMult);
        }

        return {
            delta: {},
            continueExecution: true,
        };
    }
}
