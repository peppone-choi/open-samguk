/**
 * 비급(징병) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_징병.php
 * - [군사] 징모병 시 훈사 70/84 (기본 50/60 대비), 통솔 +25%
 * - 인구 변동 없음 효과는 레거시 특수 로직으로, 현재 시스템에서는 구현하지 않음
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_징병';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(징병)',
    info: '[군사] 징모병 시 훈사 70/84, 통솔 +25%',
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
        // 통솔력 +25%
        if (statName === 'leadership') {
            return Math.floor((value as number) * 1.25);
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
    onCalcDomestic: (_context, turnType, varType, value, _aux) => {
        if (turnType === '징병' || turnType === '모병') {
            // 훈련 70 (기본 50 대비)
            if (varType === 'train') {
                return 70;
            }
            // 사기 84 (기본 60 대비)
            if (varType === 'atmos') {
                return 84;
            }
        }
        return value;
    },
};
