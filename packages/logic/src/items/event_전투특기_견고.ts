/**
 * 비급(견고) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_견고.php
 * - [전투] 상대 필살 확률 -20%p, 상대 계략 시도시 성공 확률 -10%p, 부상 없음, 아군 피해 -10%
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_부상무효 } from '@sammo-ts/logic/war/triggers/che_견고.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_견고';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(견고)',
    info: '[전투] 상대 필살 확률 -20%p, 상대 계략 시도시 성공 확률 -10%p, 부상 없음, 아군 피해 -10%',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    onCalcOpposeStat: function (
        _context: GeneralActionContext | WarActionContext,
        statName: GeneralStatName | WarStatName,
        value: unknown,
        _aux?: unknown
    ): unknown {
        if (Array.isArray(value)) {
            return value;
        }
        if (statName === 'warMagicSuccessProb') {
            return (value as number) - 0.1;
        }
        if (statName === 'warCriticalRatio') {
            return (value as number) - 0.2;
        }
        return value;
    } as NonNullable<ItemModule['onCalcOpposeStat']>,
    getWarPowerMultiplier: () => [1, 0.9],
    getBattleInitTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(new che_부상무효(context.unit));
    },
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(new che_부상무효(context.unit));
    },
};
