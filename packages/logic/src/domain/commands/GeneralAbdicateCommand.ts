import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 선양 커맨드 - 군주가 다른 장수에게 군주 자리를 넘김
 * 레거시: che_선양
 */
export class GeneralAbdicateCommand extends GeneralCommand {
  readonly actionName = '선양';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.BeLord(),
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
            [actorId]: [`선양 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destGeneralId } = args;
    if (!destGeneralId) {
      return {
        logs: {
          general: { [actorId]: ['선양 실패: 대상 장수가 지정되지 않았습니다.'] },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const destGeneral = snapshot.generals[destGeneralId];
    const iNation = snapshot.nations[iGeneral.nationId];

    if (!destGeneral) {
      return {
        logs: {
          general: { [actorId]: ['선양 실패: 존재하지 않는 장수입니다.'] },
        },
      };
    }

    if (destGeneral.nationId !== iGeneral.nationId) {
      return {
        logs: {
          general: { [actorId]: ['선양 실패: 같은 국가의 장수가 아닙니다.'] },
        },
      };
    }

    return {
      generals: {
        [actorId]: {
          officerLevel: 1,
          experience: Math.floor(iGeneral.experience * 0.7),
        },
        [destGeneralId]: {
          officerLevel: 12, // 군주
        },
      },
      logs: {
        general: {
          [actorId]: [`${destGeneral.name}에게 군주의 자리를 물려줍니다.`],
          [destGeneralId]: [`${iGeneral.name}에게서 군주의 자리를 물려받습니다.`],
        },
        global: [`【선양】${iGeneral.name}이(가) ${iNation.name}의 군주 자리를 ${destGeneral.name}에게 선양했습니다.`],
        nation: {
          [iGeneral.nationId]: [`${iGeneral.name}이(가) ${destGeneral.name}에게 선양`],
        },
      },
    };
  }
}
