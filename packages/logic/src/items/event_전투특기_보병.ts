/**
 * 비급(보병) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_보병.php
 * - [군사] 보병 계통 징·모병비 -10%
 * - [전투] 공격 시 피해 -10%, 수비 시 피해 -20%, 공격시 상대 병종에/수비시 자신 병종 숙련에 보병 숙련을 가산
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import { getMetaNumber } from '@sammo-ts/logic/war/utils.js';
import { getAuxArmType, parseWarDexAux } from '@sammo-ts/logic/triggers/special/war/aux.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_보병';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(보병)',
    info: '[군사] 보병 계통 징·모병비 -10%<br>[전투] 공격 시 피해 -10%, 수비 시 피해 -20%,<br>공격시 상대 병종에/수비시 자신 병종 숙련에 보병 숙련을 가산',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    onCalcDomestic: (_context, turnType, varType, value, aux) => {
        if (turnType === '징병' || turnType === '모병') {
            const armType = getAuxArmType(aux);
            // footman = 1 (보병)
            if (varType === 'cost' && armType === 1) {
                return value * 0.9;
            }
        }
        return value;
    },
    getWarPowerMultiplier: (_context, unit, _oppose) => {
        if (unit.isAttacker()) {
            return [1, 0.9]; // 공격 시 피해 -10%
        }
        return [1, 0.8]; // 수비 시 피해 -20%
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

        if (!('unit' in context) || !context.unit) {
            return value;
        }
        const unit = context.unit;

        const footmanType = unit.getGameConfig().armTypes.footman;
        if (footmanType === undefined) {
            return value;
        }

        if ((statName as string).startsWith('dex')) {
            const myDex = getMetaNumber(context.general.meta, `dex${footmanType}`);
            const { isAttacker, opposeType } = parseWarDexAux(aux);

            if (isAttacker && opposeType && statName === `dex${opposeType.armType}`) {
                return (value as number) + myDex;
            }
            if (!isAttacker && statName === `dex${footmanType}`) {
                return (value as number) + myDex;
            }
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
