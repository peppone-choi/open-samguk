/**
 * 비급(의술) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_의술.php
 * - [전투] 40% 확률로 부상 회복 발동
 */
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_의술시도, che_의술발동 } from '@sammo-ts/logic/war/triggers/che_의술.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_의술';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(의술)',
    info: '[전투] 40% 확률로 부상 회복 발동',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(new che_의술시도(context.unit), new che_의술발동(context.unit));
    },
};
