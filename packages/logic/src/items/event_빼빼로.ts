/**
 * 빼빼로 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_빼빼로.php
 * - 통솔/무력/지력 +1
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_빼빼로';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '빼빼로',
    name: '빼빼로',
    info: '통솔/무력/지력 +1',
    slot: 'item',
    cost: 10,
    buyable: false, // 이벤트 아이템
    consumable: false,
    reqSecu: 0,
    unique: true,
    onCalcStat: function (
        _context: GeneralActionContext | WarActionContext,
        statName: GeneralStatName | WarStatName,
        value: unknown,
        _aux?: unknown
    ): unknown {
        if (Array.isArray(value)) {
            return value;
        }
        if (statName === 'leadership' || statName === 'strength' || statName === 'intelligence') {
            return (value as number) + 1;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
