import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { General } from '../models/General.js';
import { City } from '../models/City.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 정착 장려 커맨드
 * 레거시: che_정착장려
 */
export class GeneralDevelopPopulationCommand extends GeneralCommand {
  readonly actionName = '정착 장려';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.SuppliedCity(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iCity = snapshot.cities[iGeneral.cityId];
    if (!iCity) throw new Error(`도시 ${iGeneral.cityId}를 찾을 수 없습니다.`);

    // 비용 계산 (develcost * 2, 군량 소모)
    const develCost = (snapshot.env.develcost ?? 100) * 2;
    const reqRice = develCost;

    // 제약 조건 검사
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: { [actorId]: [`정착 장려 실패: ${check.reason}`] },
        },
      };
    }

    if (iGeneral.rice < reqRice) {
        return {
            logs: {
                general: { [actorId]: [`정착 장려 실패: 군량이 부족합니다. (필요: ${reqRice})`] },
            },
        };
    }

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const city = new City(iCity);

    // 정착 장려 로직 수행
    const { delta: generalDelta, popGain, pick } = general.developPopulation(
        rng, 
        iGeneral.leadership, 
        iGeneral.meta.explevel ?? 0
    );

    const cityDelta = city.increasePop(popGain);
    generalDelta.rice = iGeneral.rice - reqRice;

    let logMsg = `정착을 장려하여 주민이 ${popGain}명 증가했습니다.`;
    if (pick === 'success') {
        logMsg = `정착 장려에 성공하여 주민이 ${popGain}명 증가했습니다.`;
    } else if (pick === 'fail') {
        logMsg = `정착 장려에 실패하여 주민이 ${popGain}명 증가했습니다.`;
    }

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [iCity.id]: cityDelta,
      },
      logs: {
        general: {
          [actorId]: [logMsg],
        },
      },
    };
  }
}
