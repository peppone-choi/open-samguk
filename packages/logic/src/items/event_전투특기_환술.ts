/**
 * 비급(환술) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_환술.php
 * - [전투] 계략 성공 +10%p, 계략 대미지 +30%
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_환술';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(환술)',
    info: '[전투] 계략 성공 +10%p, 계략 대미지 +30%',
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
            return (value as number) + 0.1;
        }
        // 계략 대미지 +30%
        if (statName === 'warMagicSuccessDamage') {
            return (value as number) * 1.3;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
