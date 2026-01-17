import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_반계시도, che_반계발동 } from '@sammo-ts/logic/war/triggers/che_반계.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'che_반계_파초선';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '파초선',
    name: '파초선(반계)',
    info: '[전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 20% 확률로 되돌림',
    slot: 'item',
    cost: 200,
    buyable: false,
    consumable: false,
    reqSecu: 0,
    unique: true,
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
        return value;
    } as NonNullable<ItemModule['onCalcOpposeStat']>,
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(new che_반계시도(context.unit, 0.2), new che_반계발동(context.unit));
    },
};
