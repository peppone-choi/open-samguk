/**
 * 동작(숙련) - che_숙련_동작.php 포팅
 * [기타] 숙련도 획득량 +20%
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class BronzeSparrowItem extends BaseItem {
    readonly code = "che_숙련_동작";
    readonly rawName = "동작";
    readonly name = "동작(숙련)";
    readonly info = "[기타] 숙련도 획득량 +20%";
    readonly type = "item" as const;
    readonly cost = 200;
    readonly consumable = false;
    readonly buyable = false;
    readonly reqSecu = 0;

    onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
        if (statName === "addDex") {
            return value * 1.2;
        }
        return value;
    }
}
