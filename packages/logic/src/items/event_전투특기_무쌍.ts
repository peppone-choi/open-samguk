/**
 * 비급(무쌍) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_무쌍.php
 * - [전투] 대미지 +5%, 피해 -2%, 공격 필살 +10%p, 승리수 비례 보정
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_무쌍';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(무쌍)',
    info: '[전투] 대미지 +5%, 피해 -2%, 공격 필살 +10%p, 승리수 비례 보정',
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
        if (statName === 'warCriticalRatio') {
            return (value as number) + 0.1;
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
    getWarPowerMultiplier: (context, _unit, _oppose) => {
        // 무쌍: 대미지 +5%, 피해 -2%
        // 추가로 승리수 비례 보정 (승리수 * 0.002, 최대 0.1)
        const killNum = (context.general.meta.killnum as number | undefined) ?? 0;
        const killBonus = Math.min(killNum * 0.002, 0.1);
        return [1.05 + killBonus, 0.98 - killBonus];
    },
};
