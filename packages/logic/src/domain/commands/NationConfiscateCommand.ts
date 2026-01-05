import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 몰수 커맨드
 * 레거시: che_몰수
 */
export class NationConfiscateCommand extends GeneralCommand {
  readonly actionName = '몰수';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(), // 군주/수뇌만 가능
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestGeneral(),
      ConstraintHelper.FriendlyDestGeneral(), // 같은 국가 장수만 가능
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`몰수 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destGeneralId, amount, isGold } = args;
    const iActor = snapshot.generals[actorId]!;
    const iDest = snapshot.generals[destGeneralId]!;
    const nation = snapshot.nations[iActor.nationId]!;

    const resKey = isGold ? 'gold' : 'rice';
    const resName = isGold ? '금' : '쌀';

    // 실제 몰수 가능한 금액 계산
    const actualAmount = Math.min(amount, iDest[resKey]);
    if (actualAmount <= 0) {
      return {
        logs: {
          general: {
            [actorId]: [`${iDest.name}에게서 몰수할 ${resName}이 없습니다.`],
          },
        },
      };
    }

    const delta: WorldDelta = {
      generals: {
        [destGeneralId]: {
          [resKey]: iDest[resKey] - actualAmount,
        },
      },
      nations: {
        [iActor.nationId]: {
          [resKey]: nation[resKey] + actualAmount,
        },
      },
      logs: {
        general: {
          [actorId]: [`${iDest.name}에게서 ${resName} ${actualAmount}을 몰수했습니다.`],
          [destGeneralId]: [`${resName} ${actualAmount}을 몰수 당했습니다.`],
        },
      },
    };

    return delta;
  }
}
