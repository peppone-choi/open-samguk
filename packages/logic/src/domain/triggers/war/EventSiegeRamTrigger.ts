import { WarUnitTrigger, WarUnitTriggerContext, WarUnitTriggerResult } from "../../WarUnitTriggerRegistry.js";
import { TriggerPriority } from "../../WarUnitTriggerRegistry.js";
import { WarUnitGeneral } from "../../WarUnitGeneral.js";
import { WarUnitCity } from "../../WarUnitCity.js";

/**
 * 충차 아이템 소모 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/event_충차아이템소모.php
 */
export class EventSiegeRamTrigger extends WarUnitTrigger {
    readonly name = "충차소모";

    constructor(unit: any, raiseType: any = 0) {
        super(unit, raiseType);
    }

    readonly priority = TriggerPriority.BEGIN + 200;

    attempt(_ctx: WarUnitTriggerContext): boolean {
        return true;
    }

    actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
        const { self, oppose } = ctx;

        if (!(self instanceof WarUnitGeneral)) return new WarUnitTriggerResult(true);
        if (!(oppose instanceof WarUnitCity)) return new WarUnitTriggerResult(true);

        if (self.hasActivatedSkillOnLog("충차공격")) return new WarUnitTriggerResult(true);

        const general = self.general;
        const remainKey = "remain충차";
        const remain = (general.meta?.[remainKey] as number) ?? 0;

        self.activateSkill("충차공격");
        if (general.meta) {
            general.meta[remainKey] = remain - 1;
            if ((general.meta[remainKey] as number) <= 0) {
                // 아이템 소모
                general.item = ""; // null 대신 ""
                delete general.meta[remainKey];
            }
        }

        return new WarUnitTriggerResult(true);
    }
}
