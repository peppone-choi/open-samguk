import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_위압시도, che_위압발동 } from '@sammo-ts/logic/war/triggers/che_위압.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'che_위압_조목삭';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '조목삭',
    name: '조목삭(위압)',
    info: '[전투] 첫 페이즈 위압 발동(적 공격, 회피 불가, 사기 5 감소)',
    slot: 'item',
    cost: 200,
    buyable: false,
    consumable: false,
    reqSecu: 0,
    unique: true,
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(new che_위압시도(context.unit), new che_위압발동(context.unit));
    },
};
