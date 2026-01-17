/**
 * 충차 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_충차.php
 * - [전투] 성벽 대미지 +50%
 * - 주의: 소모품 처리는 상위 시스템에서 담당
 */
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_충차';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '충차',
    name: '충차',
    info: '[전투] 성벽 대미지 +50%',
    slot: 'item',
    cost: 50,
    buyable: true,
    consumable: true,
    reqSecu: 1000,
    unique: false,
    getWarPowerMultiplier: (_context, _unit, oppose) => {
        // 상대가 성벽(WarUnitCity)인 경우에만 적용
        if (oppose.constructor.name === 'WarUnitCity') {
            return [1.5, 1];
        }
        return [1, 1];
    },
};
