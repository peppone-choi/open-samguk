/**
 * 비급(신중) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_신중.php
 * - [전투] 계략 성공 확률 100%
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_신중';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(신중)',
    info: '[전투] 계략 성공 확률 100%',
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
            // 계략 성공 확률 100%로 설정 (매우 큰 값 추가)
            return 1.0;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
