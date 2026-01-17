/**
 * 비급(격노) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_격노.php
 * - [전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동,
 *   공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩
 */
import { BaseWarUnitTrigger, WarTriggerCaller } from '@sammo-ts/logic/war/triggers.js';
import { che_격노발동, che_격노시도 } from '@sammo-ts/logic/war/triggers/che_격노.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_격노';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(격노)',
    info: '[전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동, 공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    getWarPowerMultiplier: (_context, unit, _oppose) => {
        const activatedCnt = unit.hasActivatedSkillOnLog('격노');
        return [1 + 0.2 * activatedCnt, 1];
    },
    getBattlePhaseTriggerList: (context) => {
        if (!context.unit) return null;
        return new WarTriggerCaller(
            new che_격노시도(context.unit, BaseWarUnitTrigger.TYPE_ITEM),
            new che_격노발동(context.unit, BaseWarUnitTrigger.TYPE_ITEM)
        );
    },
};
