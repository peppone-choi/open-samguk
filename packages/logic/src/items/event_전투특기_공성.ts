/**
 * 비급(공성) 아이템
 * - 레거시: legacy/core/hwe/sammo/ActionItem/event_전투특기_공성.php
 * - [군사] 차병 계통 징·모병비 -10%
 * - [전투] 성벽 공격 시 대미지 +100%, 공격시 상대 병종에/수비시 자신 병종 숙련에 차병 숙련을 가산
 */
import type { GeneralActionContext } from '@sammo-ts/logic/triggers/general.js';
import type { GeneralStatName, WarStatName } from '@sammo-ts/logic/triggers/types.js';
import type { WarActionContext } from '@sammo-ts/logic/war/actions.js';
import { getMetaNumber } from '@sammo-ts/logic/war/utils.js';
import { getAuxArmType, parseWarDexAux } from '@sammo-ts/logic/triggers/special/war/aux.js';
import type { ItemModule } from './types.js';

const ITEM_KEY = 'event_전투특기_공성';

export const itemModule: ItemModule = {
    key: ITEM_KEY,
    rawName: '비급',
    name: '비급(공성)',
    info: '[군사] 차병 계통 징·모병비 -10%<br>[전투] 성벽 공격 시 대미지 +100%,<br>공격시 상대 병종에/수비시 자신 병종 숙련에 차병 숙련을 가산',
    slot: 'item',
    cost: 100,
    buyable: true,
    consumable: false,
    reqSecu: 3000,
    unique: false,
    onCalcDomestic: (_context, turnType, varType, value, aux) => {
        if (turnType === '징병' || turnType === '모병') {
            const armType = getAuxArmType(aux);
            // siege = 5 (차병)
            if (varType === 'cost' && armType === 5) {
                return value * 0.9;
            }
        }
        return value;
    },
    getWarPowerMultiplier: (_context, _unit, oppose) => {
        // WarUnitCity check
        if (oppose.constructor.name === 'WarUnitCity') {
            return [2, 1];
        }
        return [1, 1];
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

        const siegeType = unit.getGameConfig().armTypes.siege;
        if (siegeType === undefined) {
            return value;
        }

        if ((statName as string).startsWith('dex')) {
            const myDex = getMetaNumber(context.general.meta, `dex${siegeType}`);
            const { isAttacker, opposeType } = parseWarDexAux(aux);

            if (isAttacker && opposeType && statName === `dex${opposeType.armType}`) {
                return (value as number) + myDex;
            }
            if (!isAttacker && statName === `dex${siegeType}`) {
                return (value as number) + myDex;
            }
        }
        return value;
    } as NonNullable<ItemModule['onCalcStat']>,
};
