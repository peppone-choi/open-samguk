/**
 * 비급(반계) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_반계.php
 * - [전투] 상대 계략 -10%p, 40% 되돌림
 *
 * NOTE: 레거시의 반목 대미지 +90%는 warMagicCoef stat이 별도로 정의되지 않아 생략.
 * 필요시 반목 계략 시스템 구현 시 추가.
 */
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_반계시도 } from '@sammo-ts/logic/war/triggers/che_반계.js';
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_반계';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(반계)',
    info: '[전투] 상대 계략 -10%p, 40% 되돌림',
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
        // 상대의 계략 성공 확률 -10%p
        if (statName === 'warMagicSuccessProb') {
            return (value as number) - 0.1;
        }
        return value;
    } as NonNullable<ItemModule['onCalcOpposeStat']>,
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        // 40% 확률로 상대 계략 되돌림
        return new WarTriggerCaller(new che_반계시도(context.unit, 0.4));
    },
};
