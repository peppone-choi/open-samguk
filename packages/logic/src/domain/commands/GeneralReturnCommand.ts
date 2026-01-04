import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 귀환 커맨드
 * 레거시: che_귀환
 */
export class GeneralReturnCommand extends GeneralCommand {
  readonly actionName = '귀환';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
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
            [actorId]: [`귀환 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iNation = snapshot.nations[iGeneral.nationId];
    const capitalCityId = iNation.capitalCityId;

    if (iGeneral.cityId === capitalCityId) {
      return {
        logs: {
          general: { [actorId]: ['이미 수도에 있습니다.'] },
        },
      };
    }

    const iCapitalCity = snapshot.cities[capitalCityId];

    return {
      generals: {
        [actorId]: {
          cityId: capitalCityId,
          experience: iGeneral.experience + 50,
        },
      },
      logs: {
        general: {
          [actorId]: [`수도 ${iCapitalCity.name}으로 귀환했습니다.`],
        },
      },
    };
  }
}
