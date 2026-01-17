/**
 * 비급(돌격) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_돌격.php
 * - [전투] 선제 페이즈 +2, 공격 대미지 +5%, 유리 병종에게 퇴각 전까지 전투
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_돌격지속 } from '@sammo-ts/logic/war/triggers/che_돌격.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_돌격';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(돌격)',
    info: '[전투] 선제 페이즈 +2, 공격 대미지 +5%, 유리 병종에게 퇴각 전까지 전투',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    onCalcStat: function (
        _context: GeneralActionContext | WarActionContext,
        statName: GeneralStatName | WarStatName,
        value: unknown,
        _aux?: unknown
    ): unknown {
        if (Array.isArray(value)) {
            return value;
        }
        // 선제 페이즈 +2
        if (statName === 'initWarPhase') {
            return (value as number) + 2;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
    getWarPowerMultiplier: (_context, unit, _oppose) => {
        if (unit.isAttacker()) {
            return [1.05, 1];
        }
        return [1, 1];
    },
    // 돌격지속: 유리 병종에게 퇴각 전까지 전투 (페이즈 +1 지속)
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(new che_돌격지속(context.unit));
    },
};
