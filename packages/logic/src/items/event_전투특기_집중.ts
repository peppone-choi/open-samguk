/**
 * 비급(집중) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_집중.php
 * - [전투] 계략 성공 시 대미지 +50%
 * - 주의: warMagicSuccessDamage stat을 사용하여 계략 성공 대미지 증가
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_집중';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(집중)',
    info: '[전투] 계략 성공 시 대미지 +50%',
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
        // 계략 성공 대미지 +50%
        if (statName === 'warMagicSuccessDamage') {
            return (value as number) * 1.5;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
