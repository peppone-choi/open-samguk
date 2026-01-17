/**
 * 비급(저격) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_저격.php
 * - [전투] 새 상대와 전투 시 50% 저격 발동, 사기+20
 */
import { WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_저격시도, che_저격발동 } from '@sammo-ts/logic/war/triggers/che_저격.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_저격';

// 저격 시도/발동에 사용할 raiseType 상수
const RAISE_TYPE_ITEM = 2;

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(저격)',
    info: '[전투] 새 상대와 전투 시 50% 저격 발동, 사기+20',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    getBattleInitTriggerList: (context) => {
        if (!context.unit) return null;
        // 50% 확률, 부상 10~80, 사기 +20
        return new WarTriggerCaller(
            new che_저격시도(context.unit, RAISE_TYPE_ITEM, 0.5, 10, 80, 20),
            new che_저격발동(context.unit, RAISE_TYPE_ITEM)
        );
    },
};
