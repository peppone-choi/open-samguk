import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

export class NationRandomCapitalCommand extends GeneralCommand {
  readonly actionName = "무작위 수도 이전";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeLord(),
      ConstraintHelper.SuppliedCity(),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  getPreReqTurn(): number {
    return 1;
  }

  getPostReqTurn(): number {
    return 0;
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: ["무작위 수도 이전 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const canRandomCapital = iNation.meta?.can_무작위수도이전 ?? 0;
    if (canRandomCapital <= 0) {
      return {
        logs: {
          general: { [actorId]: ["무작위 수도 이전 실패: 더이상 변경이 불가능합니다."] },
        },
      };
    }

    const emptyCities = Object.values(snapshot.cities).filter(
      (c) => c.nationId === 0 && c.level >= 5 && c.level <= 6
    );

    if (emptyCities.length === 0) {
      return {
        logs: {
          general: { [actorId]: ["무작위 수도 이전 실패: 이동할 수 있는 도시가 없습니다."] },
        },
      };
    }

    const destCity = rng.choice(emptyCities);
    const oldCapitalId = iNation.capitalCityId;

    const josaRo = JosaUtil.pick(destCity.name, "로");
    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");

    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const nationGenerals = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iNation.id
    );

    const generalUpdates: Record<number, any> = {
      [actorId]: {
        cityId: destCity.id,
        experience: iActor.experience + expGain,
        dedication: iActor.dedication + expGain,
        lastTurn: {
          action: this.actionName,
          destCityId: destCity.id,
        },
      },
    };

    const broadcastMessage = `국가 수도를 【${destCity.name}】${josaRo} 옮겼습니다.`;
    const generalLogs: Record<number, string[]> = {
      [actorId]: [`【${destCity.name}】${josaRo} 국가를 옮겼습니다.`],
    };

    for (const gen of nationGenerals) {
      if (gen.id !== actorId) {
        generalUpdates[gen.id] = { cityId: destCity.id };
        generalLogs[gen.id] = [broadcastMessage];
      }
    }

    const newMeta = { ...iNation.meta, can_무작위수도이전: canRandomCapital - 1 };

    return {
      generals: generalUpdates,
      cities: {
        [destCity.id]: {
          nationId: iNation.id,
          conflict: {},
        },
        [oldCapitalId]: {
          nationId: 0,
          front: 0,
          conflict: {},
        },
      },
      nations: {
        [iNation.id]: {
          capitalCityId: destCity.id,
          meta: newMeta,
        },
      },
      logs: {
        general: generalLogs,
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 【${destCity.name}】${josaRo} 무작위 수도 이전`],
        },
        global: [
          `【${iNation.name}】${josaYiNation} 【${destCity.name}】${josaRo} 수도 이전하였습니다.`,
        ],
      },
    };
  }
}
