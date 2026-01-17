/**
 * 비급(신산) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_신산.php
 * - [전투] 계략 성공률 +10%p, 계략 시도/성공 확률 +20%p
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_신산';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(신산)',
    info: '[전투] 계략 성공률 +10%p, 계략 시도/성공 확률 +20%p',
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
        if (statName === 'warMagicSuccessProb') {
            // 계략 성공률 +30%p (10%p + 20%p 추가)
            return (value as number) + 0.3;
        }
        if (statName === 'warMagicTrialProb') {
            // 계략 시도 확률 +20%p
            return (value as number) + 0.2;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
