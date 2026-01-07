import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 초토화 커맨드 - 자국 도시를 공백지로 만들고 자원 회수
 * 레거시: che_초토화
 * Priority: 특수 커맨드
 */
export class NationScorchedEarthCommand extends GeneralCommand {
  readonly actionName = "초토화";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.ReqNationValue("surrenderLimit", "외교제한 턴", "==", 0, "외교제한 턴이 남아있습니다."),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.OccupiedDestCity(),
      ConstraintHelper.SuppliedDestCity(),
      ConstraintHelper.ReqNationValue("capitalCityId", "수도", "!=", { kind: "arg", key: "destCityId" }, "수도입니다."),
      ConstraintHelper.DisallowDiplomacyStatus([], [0], "평시에만 가능합니다."),
    ];
  }

  getPreReqTurn(): number {
    return 2;
  }

  getPostReqTurn(): number {
    return 24;
  }

  calcReturnAmount(destCity: any): number {
    let amount = destCity.pop / 5;
    const resources = ["agri", "comm", "secu"];
    for (const res of resources) {
      const resVal = destCity[res];
      const resMax = destCity[`${res}Max`];
      amount *= ((resVal - resMax * 0.5) / resMax) + 0.8;
    }
    return Math.floor(amount);
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
          general: { [actorId]: ["초토화 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destCityId } = args;
    if (destCityId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["초토화 실패: 대상 도시가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity) {
      return {
        logs: {
          general: { [actorId]: ["초토화 실패: 대상 도시를 찾을 수 없습니다."] },
        },
      };
    }

    if (iDestCity.nationId !== iNation.id) {
      return {
        logs: {
          general: { [actorId]: ["초토화 실패: 자국 도시만 초토화할 수 있습니다."] },
        },
      };
    }

    if (iNation.capitalCityId === destCityId) {
      return {
        logs: {
          general: { [actorId]: ["초토화 실패: 수도는 초토화할 수 없습니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaUl = JosaUtil.pick(iDestCity.name, "을");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");

    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const amount = this.calcReturnAmount(iDestCity);

    const generalUpdates: Record<number, any> = {
      [actorId]: {
        experience: Math.floor(iActor.experience * 0.9) + expGain,
        dedication: iActor.dedication + expGain,
        lastTurn: {
          action: this.actionName,
          destCityId,
        },
      },
    };

    Object.values(snapshot.generals)
      .filter((g) => g.nationId === iNation.id && g.id !== actorId && g.officerLevel >= 5)
      .forEach((g) => {
        generalUpdates[g.id] = {
          experience: Math.floor(g.experience * 0.9),
        };
      });

    return {
      generals: generalUpdates,
      cities: {
        [destCityId]: {
          nationId: 0,
          pop: Math.max(Math.floor(iDestCity.popMax * 0.1), Math.floor(iDestCity.pop * 0.2)),
          agri: Math.max(Math.floor(iDestCity.agriMax * 0.1), Math.floor(iDestCity.agri * 0.2)),
          comm: Math.max(Math.floor(iDestCity.commMax * 0.1), Math.floor(iDestCity.comm * 0.2)),
          secu: Math.max(Math.floor(iDestCity.secuMax * 0.1), Math.floor(iDestCity.secu * 0.2)),
          def: Math.max(Math.floor(iDestCity.defMax * 0.1), Math.floor(iDestCity.def * 0.2)),
          wall: Math.max(Math.floor(iDestCity.wallMax * 0.1), Math.floor(iDestCity.wall * 0.5)),
          trust: Math.max(50, iDestCity.trust),
        },
      },
      nations: {
        [iNation.id]: {
          gold: iNation.gold + amount,
          rice: iNation.rice + amount,
          surrenderLimit: 24, // 24턴 외교제한
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestCity.name}】${josaUl} 초토화했습니다.`],
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 【${iDestCity.name}】${josaUl} 초토화 명령`],
        },
        global: [
          `${iActor.name}${josaYi} 【${iDestCity.name}】${josaUl} 초토화하였습니다.`,
          `【초토화】${iNation.name}${josaYiNation} 【${iDestCity.name}】${josaUl} 초토화하였습니다.`,
        ],
      },
    };
  }
}
