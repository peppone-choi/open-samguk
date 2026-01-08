import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 발령 커맨드 - 장수를 특정 도시로 이동
 * 레거시: che_발령
 */
export class NationAppointCommand extends GeneralCommand {
  readonly actionName = "발령";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestGeneral(),
      ConstraintHelper.FriendlyDestGeneral(),
      ConstraintHelper.OccupiedDestCity(),
      ConstraintHelper.SuppliedDestCity(),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation)
      return {
        logs: { general: { [actorId]: ["발령 실패: 소속 국가 정보를 찾을 수 없습니다."] } },
      };

    const { destGeneralId, destCityId } = args;
    if (destGeneralId === undefined || destCityId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["발령 실패: 대상 장수 또는 대상 도시가 지정되지 않았습니다."] },
        },
      };
    }

    if (destGeneralId === actorId) {
      return {
        logs: { general: { [actorId]: ["발령 실패: 본인에게는 발령할 수 없습니다."] } },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral) {
      return {
        logs: { general: { [actorId]: ["발령 실패: 대상 장수를 찾을 수 없습니다."] } },
      };
    }

    if (iDestGeneral.nationId !== iNation.id) {
      return {
        logs: { general: { [actorId]: ["발령 실패: 타국 장수에게는 발령할 수 없습니다."] } },
      };
    }

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity) {
      return {
        logs: { general: { [actorId]: ["발령 실패: 대상 도시를 찾을 수 없습니다."] } },
      };
    }

    const josaUl = JosaUtil.pick(iDestGeneral.name, "을");
    const josaRo = JosaUtil.pick(iDestCity.name, "로");
    const yearMonth = snapshot.gameTime.year * 12 + snapshot.gameTime.month;

    return {
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destGeneralId,
            destCityId,
          },
        },
        [destGeneralId]: {
          cityId: destCityId,
          meta: {
            ...iDestGeneral.meta,
            lastAppoint: yearMonth,
          },
        },
      },
      logs: {
        general: {
          [actorId]: [
            `【${iDestGeneral.name}】${josaUl} 【${iDestCity.name}】${josaRo} 발령했습니다.`,
          ],
          [destGeneralId]: [`${iActor.name}에 의해 【${iDestCity.name}】${josaRo} 발령됐습니다.`],
        },
      },
    };
  }
}
