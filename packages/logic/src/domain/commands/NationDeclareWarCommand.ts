import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta, Message } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { areNationsNeighbors } from "../constraints/NearNationConstraint.js";

/**
 * 선전포고 커맨드
 * 레거시: che_선전포고
 */
export class NationDeclareWarCommand extends GeneralCommand {
  readonly actionName = "선전포고";

  constructor() {
    super();
    const startYear = 0; // 초기화 시점에는 snapshots가 없으므로 0으로 두거나 생성자에서 처리 불가
    this.minConditionConstraints = [
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
      // ConstraintHelper.ReqEnvValue("year", ">=", startYear + 1, "초반제한 해제 2년전부터 가능합니다."),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestNation(),
      ConstraintHelper.NearNation(),
      ConstraintHelper.DisallowDiplomacyBetweenStatus({
        0: "아국과 이미 교전중입니다.",
        1: "아국과 이미 선포중입니다.",
        7: "불가침국입니다.",
      }),
    ];
  }

  // NOTE: ReqEnvValue 에서 startYear + 1 체크는 run에서 수행하거나 ConstraintHelper를 보강해야 함.

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
            [actorId]: ["선전포고 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { destNationId } = args;
    if (destNationId === undefined) {
      return {
        logs: { general: { [actorId]: ["선전포고 실패: 대상 국가가 지정되지 않았습니다."] } },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: { general: { [actorId]: ["선전포고 실패: 대상 국가를 찾을 수 없습니다."] } },
      };
    }

    // 자국 체크
    if (destNationId === iNation.id) {
      return {
        logs: { general: { [actorId]: ["선전포고 실패: 자국에게는 선전포고할 수 없습니다."] } },
      };
    }

    // 중립 세력 체크
    if (destNationId === 0) {
      return {
        logs: {
          general: { [actorId]: ["선전포고 실패: 중립 세력에게는 선전포고할 수 없습니다."] },
        },
      };
    }

    // 인접 국가 체크
    if (!areNationsNeighbors(iNation.id, destNationId, snapshot.cities)) {
      return {
        logs: { general: { [actorId]: ["선전포고 실패: 인접 국가가 아닙니다."] } },
      };
    }

    // 초반제한 체크
    const startYear = snapshot.env.startyear ?? snapshot.gameTime.year;
    if (snapshot.gameTime.year < startYear + 1) {
      return {
        logs: {
          general: { [actorId]: ["선전포고 실패: 초반제한 해제 2년전부터 가능합니다."] },
        },
      };
    }

    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    // 외교 상태 체크
    if (iDiplomacy) {
      if (iDiplomacy.state === "0") {
        return {
          logs: { general: { [actorId]: ["선전포고 실패: 이미 교전중입니다."] } },
        };
      }
      if (iDiplomacy.state === "1") {
        return {
          logs: { general: { [actorId]: ["선전포고 실패: 이미 선포중입니다."] } },
        };
      }
      if (iDiplomacy.state === "7") {
        return {
          logs: { general: { [actorId]: ["선전포고 실패: 불가침국입니다."] } },
        };
      }
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");

    const message: Message = {
      id: Date.now(),
      mailbox: `nation:${destNationId}`,
      srcId: actorId,
      destId: null,
      text: `【외교】${snapshot.gameTime.year}년 ${snapshot.gameTime.month}월: ${iNation.name}에서 ${iDestNation.name}에 선전포고`,
      sentAt: new Date(),
      meta: {
        type: "diplomacy",
        action: "declare_war",
        srcNationId: iNation.id,
        destNationId: destNationId,
        srcGeneralId: actorId,
      },
    };

    return {
      diplomacy: {
        [diplomacyKey]: {
          srcNationId: iNation.id,
          destNationId: destNationId,
          state: "1",
          term: 24,
        },
        [reverseDiplomacyKey]: {
          srcNationId: destNationId,
          destNationId: iNation.id,
          state: "1",
          term: 24,
        },
      },
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destNationId,
          },
        },
      },
      messages: [message],
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】에 선전 포고 했습니다.`],
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 【${iDestNation.name}】에 선전 포고`],
          [destNationId]: [`【${iNation.name}】의 ${iActor.name}${josaYi} 아국에 선전 포고`],
        },
        global: [
          `${iActor.name}${josaYi} 【${iDestNation.name}】에 선전 포고 하였습니다.`,
          `【선포】 ${iNation.name}${josaYiNation} 【${iDestNation.name}】에 선전 포고 하였습니다.`,
        ],
      },
    };
  }
}
