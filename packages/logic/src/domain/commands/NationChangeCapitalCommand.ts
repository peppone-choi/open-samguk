import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { MapUtil } from "../MapData.js";

/**
 * 천도 커맨드
 * 레거시: che_천도 (국가 커맨드이나 장수가 실행)
 */
export class NationChangeCapitalCommand extends GeneralCommand {
  readonly actionName = "천도";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.BeLord(),
    ];
    // fullConditionConstraints는 run에서 거리 계산 후 동적으로 판단하거나,
    // initWithArg와 유사한 로직이 필요함.
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  private getDistance(
    snapshot: WorldSnapshot,
    nationId: number,
    destCityId: number
  ): number | undefined {
    const nation = snapshot.nations[nationId];
    if (!nation) return undefined;
    return MapUtil.getDistanceWithNation(nation.capitalCityId, destCityId, [nationId], snapshot);
  }

  private getCost(develcost: number, distance: number): number {
    return develcost * 5 * Math.pow(2, distance);
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
        logs: {
          general: {
            [actorId]: ["천도 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { destCityId } = args;
    if (destCityId === undefined)
      return {
        logs: {
          general: {
            [actorId]: ["천도 실패: 목적지 도시가 지정되지 않았습니다."],
          },
        },
      };

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity || iDestCity.nationId !== iActor.nationId) {
      return {
        logs: {
          general: {
            [actorId]: ["천도 실패: 자국 영토가 아닌 곳으로는 천도할 수 없습니다."],
          },
        },
      };
    }

    if (iNation.capitalCityId === destCityId) {
      return {
        logs: { general: { [actorId]: ["천도 실패: 이미 수도인 곳입니다."] } },
      };
    }

    const distance = this.getDistance(snapshot, iActor.nationId, destCityId);
    if (distance === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ["천도 실패: 목적지 도시까지의 경로가 차단되었습니다."],
          },
        },
      };
    }

    const develcost = snapshot.env.develcost ?? 100;
    const cost = this.getCost(develcost, distance);

    if (iNation.gold < cost || iNation.rice < cost) {
      return {
        logs: {
          general: {
            [actorId]: [`천도 실패: 자원(금/쌀)이 부족합니다. (필요: ${cost})`],
          },
        },
      };
    }

    const preReqTurn = distance * 2;
    const lastTurn = iActor.lastTurn || {};
    const currentTerm =
      lastTurn.action === this.actionName && lastTurn.destCityId === destCityId
        ? lastTurn.term || 0
        : 0;

    // 준비 턴이 남은 경우
    if (currentTerm < preReqTurn) {
      return {
        generals: {
          [actorId]: {
            lastTurn: {
              action: this.actionName,
              destCityId,
              term: currentTerm + 1,
            },
          },
        },
        logs: {
          general: {
            [actorId]: [`천도를 준비 중입니다... (${currentTerm + 1}/${preReqTurn + 1})`],
          },
        },
      };
    }

    // 실제 천도 실행
    const josaRo = JosaUtil.pick(iDestCity.name, "로");
    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");

    return {
      nations: {
        [iNation.id]: {
          capitalCityId: destCityId,
          gold: iNation.gold - cost,
          rice: iNation.rice - cost,
          // meta: { ...iNation.meta, capset: (iNation.meta.capset || 0) + 1 } // 필요시 추가
        },
      },
      generals: {
        [actorId]: {
          experience: iActor.experience + 5 * (preReqTurn + 1),
          dedication: iActor.dedication + 5 * (preReqTurn + 1),
          lastTurn: {
            action: this.actionName,
            destCityId,
            term: 0, // 완료 시 초기화
          },
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestCity.name}】${josaRo} 천도했습니다.`],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYi} 【${iDestCity.name}】${josaRo} 천도 명령을 완료하였습니다.`,
          ],
        },
        global: [
          `${iActor.name}${josaYi} 【${iDestCity.name}】${josaRo} 천도 명령을 수행하였습니다.`,
          `【천도】 ${iNation.name}${josaYiNation} 【${iDestCity.name}】${josaRo} 천도하였습니다.`,
        ],
      },
    };
  }
}
