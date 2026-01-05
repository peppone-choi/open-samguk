import { RandUtil, JosaUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 발령 커맨드
 * 레거시: che_발령
 */
export class NationAppointCommand extends GeneralCommand {
  readonly actionName = '발령';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.BeLord(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) return { logs: { general: { [actorId]: ['발령 실패: 소속 국가 정보를 찾을 수 없습니다.'] } } };

    const { destGeneralId, destCityId } = args;
    if (destGeneralId === undefined || destCityId === undefined) {
      return { logs: { general: { [actorId]: ['발령 실패: 대상 장수 또는 도시가 지정되지 않았습니다.'] } } };
    }

    if (destGeneralId === actorId) {
      return { logs: { general: { [actorId]: ['발령 실패: 본인을 발령할 수 없습니다.'] } } };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral) {
      return { logs: { general: { [actorId]: ['발령 실패: 대상 장수를 찾을 수 없습니다.'] } } };
    }

    if (iDestGeneral.nationId !== iActor.nationId) {
      return { logs: { general: { [actorId]: ['발령 실패: 타국 장수는 발령할 수 없습니다.'] } } };
    }

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity) {
      return { logs: { general: { [actorId]: ['발령 실패: 대상 도시를 찾을 수 없습니다.'] } } };
    }

    if (iDestCity.nationId !== iActor.nationId) {
      return { logs: { general: { [actorId]: ['발령 실패: 자국 영토가 아닌 곳으로는 발령할 수 없습니다.'] } } };
    }

    if (iDestCity.supply === 0) {
      return { logs: { general: { [actorId]: ['발령 실패: 보급이 단절된 도시로는 발령할 수 없습니다.'] } } };
    }

    const josaUl = JosaUtil.pick(iDestGeneral.name, '을');
    const josaRo = JosaUtil.pick(iDestCity.name, '로');

    return {
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destGeneralId,
            destCityId,
          }
        },
        [destGeneralId]: {
          cityId: destCityId,
        }
      },
      logs: {
        general: {
          [actorId]: [`【${iDestGeneral.name}】${josaUl} 【${iDestCity.name}】${josaRo} 발령했습니다.`],
          [destGeneralId]: [`【${iActor.name}】에 의해 【${iDestCity.name}】${josaRo} 발령됐습니다.`],
        },
      },
    };
  }
}
