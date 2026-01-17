/**
 * 비급(궁병) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_궁병.php
 * - [군사] 궁병 계통 징·모병비 -10%
 * - [전투] 회피 확률 +20%p, 공격시 상대 병종에/수비시 자신 병종 숙련에 궁병 숙련을 가산
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import { getMetaNumber } from '@sammo-ts/logic/war/utils.js';
import { getAuxArmType, parseWarDexAux } from '@sammo-ts/logic/triggers/special/war/aux.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_궁병';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(궁병)',
    info: '[군사] 궁병 계통 징·모병비 -10%<br>[전투] 회피 확률 +20%p,<br>공격시 상대 병종에/수비시 자신 병종 숙련에 궁병 숙련을 가산',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    onCalcDomestic: (_context, turnType, varType, value, aux) => {
        if (turnType === '징병' || turnType === '모병') {
            const armType = getAuxArmType(aux);
            // archer = 2 (궁병)
            if (varType === 'cost' && armType === 2) {
                return value * 0.9;
            }
        }
        return value;
    },
    onCalcStat: function (
        context: GeneralActionContext | WarActionContext,
        statName: GeneralStatName | WarStatName,
        value: unknown,
        aux?: unknown
    ): unknown {
        if (Array.isArray(value)) {
            return value;
        }
        if (statName === 'warAvoidRatio') {
            return (value as number) + 0.2;
        }

        if (!('unit' in context) || !context.unit) {
            return value;
        }
        const unit = context.unit;

        const archerType = unit.getGameConfig().armTypes.archer;
        if (archerType === undefined) {
            return value;
        }

        if ((statName as string).startsWith('dex')) {
            const myDex = getMetaNumber(context.general.meta, `dex${archerType}`);
            const { isAttacker, opposeType } = parseWarDexAux(aux);

            if (isAttacker && opposeType && statName === `dex${opposeType.armType}`) {
                return (value as number) + myDex;
            }
            if (!isAttacker && statName === `dex${archerType}`) {
                return (value as number) + myDex;
            }
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
