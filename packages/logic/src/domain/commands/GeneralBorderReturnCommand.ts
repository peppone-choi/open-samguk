import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 접경귀환 커맨드 - 가까운 아국 도시로 즉시 귀환
 * 레거시: che_접경귀환
 */
export class GeneralBorderReturnCommand extends GeneralCommand {
  readonly actionName = '접경귀환';

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`접경귀환 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const currentCity = snapshot.cities[iGeneral.cityId];

    // 현재 도시가 이미 아국 도시인 경우
    if (currentCity && currentCity.nationId === iGeneral.nationId) {
      return {
        logs: {
          general: { [actorId]: ['이미 아국 도시에 있습니다.'] },
        },
      };
    }

    // 가장 가까운 아국 도시 찾기 (간단 구현: 첫 번째 아국 도시로 이동)
    const friendlyCities = Object.values(snapshot.cities).filter(
      city => city.nationId === iGeneral.nationId
    );

    if (friendlyCities.length === 0) {
      return {
        logs: {
          general: { [actorId]: ['귀환할 아국 도시가 없습니다.'] },
        },
      };
    }

    // TODO: 실제 거리 계산 로직 추가 필요
    const destCity = rng.choice(friendlyCities);

    return {
      generals: {
        [actorId]: {
          cityId: destCity.id,
        },
      },
      logs: {
        general: {
          [actorId]: [`${destCity.name}(으)로 접경귀환했습니다.`],
        },
      },
    };
  }
}
