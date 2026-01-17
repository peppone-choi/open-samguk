/**
 * 비급(척사) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_척사.php
 * - [전투] 지역/도시 병종 상대 대미지 +20%, 피해 -20%
 */
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_척사';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(척사)',
    info: '[전투] 지역/도시 병종 상대 대미지 +20%, 피해 -20%',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    getWarPowerMultiplier: (_context, _unit, oppose) => {
        // 상대가 성벽(WarUnitCity)인 경우에만 적용
        if (oppose.constructor.name === 'WarUnitCity') {
            return [1.2, 0.8];
        }
        return [1, 1];
    },
};
