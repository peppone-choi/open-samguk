import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta, Message } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { areNationsNeighbors } from "../constraints/NearNationConstraint.js";

/**
 * 선전포고 커맨드 (레거시: che_선전포고)
 * 국경이 인접한 다른 세력에 전쟁을 선포합니다.
 * 선포 후 일정 기간(24턴)이 지나야 실제 공격이 가능합니다.
 */
export class NationDeclareWarCommand extends GeneralCommand {
  readonly actionName = "선전포고";

  constructor() {
    super();
    const startYear = 0; // 초기화 시점에는 snapshots가 없으므로 0으로 두거나 생성자에서 처리 불가
    this.minConditionConstraints = [
      ConstraintHelper.BeChief(), // 수뇌부(태수 이상)만 가능
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(), // 보급로가 연결되어 있어야 함
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestNation(), // 대상 국가가 존재해야 함
      ConstraintHelper.NearNation(), // 인접한 국가여야 함
      ConstraintHelper.DisallowDiplomacyBetweenStatus({
        0: "아국과 이미 교전중입니다.",
        1: "아국과 이미 선포중입니다.",
        7: "불가침국입니다.",
      }),
    ];
  }

  /**
   * 선전포고 명령을 실행합니다.
   * 외교 상태를 '선포(1)'로 변경하고 전역 로그 및 메시지를 발송합니다.
   * 
   * @param rng 난수 생성기
   * @param snapshot 월드 스냅샷
   * @param actorId 명령을 내리는 수뇌 장수 ID
   * @param args { destNationId: 대상 국가 ID }
   * @returns 외교 상태 변경 및 로그가 포함된 상태 변경 델타
   */
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
