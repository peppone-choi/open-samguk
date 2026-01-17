/**
 * 비급(필살) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_필살.php
 * - [전투] 필살 +30%p, 회피불가
 */
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_필살시도, che_필살발동, che_필살강화_회피불가 } from '@sammo-ts/logic/war/triggers/che_필살.js';
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_필살';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(필살)',
    info: '[전투] 필살 +30%p, 회피불가',
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
        if (statName === 'warCriticalRatio') {
            return (value as number) + 0.3;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
    onCalcOpposeStat: function (
        _context: GeneralActionContext | WarActionContext,
        statName: GeneralStatName | WarStatName,
        value: unknown,
        _aux?: unknown
    ): unknown {
        if (Array.isArray(value)) {
            return value;
        }
        // 상대 회피불가
        if (statName === 'warAvoidRatio') {
            return 0;
        }
        return value;
    } as NonNullable<ItemModule['onCalcOpposeStat']>,
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(
            new che_필살시도(context.unit),
            new che_필살발동(context.unit),
            new che_필살강화_회피불가(context.unit)
        );
    },
};
