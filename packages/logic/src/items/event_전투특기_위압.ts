/**
 * 비급(위압) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_위압.php
 * - [전투] 첫 페이즈 위압 발동
 */
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_위압발동 } from '@sammo-ts/logic/war/triggers/che_위압.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_위압';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(위압)',
    info: '[전투] 첫 페이즈 위압 발동',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    getBattleInitTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(new che_위압발동(context.unit));
    },
};
