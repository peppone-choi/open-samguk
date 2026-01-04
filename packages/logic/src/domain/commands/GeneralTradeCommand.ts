import { RandUtil } from '@sammo-ts/common';
import { GameConst } from '../GameConst.js';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 매매 커맨드
 * 레거시: che_매매
 */
export class GeneralTradeCommand extends GeneralCommand {
  readonly actionName = '매매';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`매매 실패: ${check.reason}`],
          },
        },
      };
    }

    const { type, amount } = args; // type: 'goldToRice' | 'riceToGold'
    if (!type || !amount || amount <= 0) {
      return {
        logs: {
          general: {
            [actorId]: ['매매 실패: 거래 유형 또는 수량이 올바르지 않습니다.'],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const marketRate = 1.0; // 임시: 시장 시세 1.0 고정
    const fee = GameConst.exchangeFee;

    let goldDelta = 0;
    let riceDelta = 0;

    if (type === 'goldToRice') {
      if (iGeneral.gold < amount) {
        return {
          logs: {
            general: { [actorId]: ['매매 실패: 금이 부족합니다.'] },
          },
        };
      }
      goldDelta = -amount;
      riceDelta = Math.floor(amount * marketRate * (1 - fee));
    } else if (type === 'riceToGold') {
      if (iGeneral.rice < amount) {
        return {
          logs: {
            general: { [actorId]: ['매매 실패: 쌀이 부족합니다.'] },
          },
        };
      }
      riceDelta = -amount;
      goldDelta = Math.floor(amount / marketRate * (1 - fee));
    } else {
      return {
        logs: {
          general: { [actorId]: ['매매 실패: 잘못된 거래 유형입니다.'] },
        },
      };
    }

    return {
      generals: {
        [actorId]: {
          gold: iGeneral.gold + goldDelta,
          rice: iGeneral.rice + riceDelta,
          experience: iGeneral.experience + 50,
          politicsExp: iGeneral.politicsExp + 1,
        },
      },
      logs: {
        general: {
          [actorId]: [
            type === 'goldToRice'
              ? `금 ${amount}을 쌀 ${riceDelta}로 바꿨습니다.`
              : `쌀 ${amount}을 금 ${goldDelta}로 바꿨습니다.`
          ],
        },
      },
    };
  }
}
