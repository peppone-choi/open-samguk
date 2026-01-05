import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 종전 수락 커맨드
 * 레거시: che_종전수락
 *
 * 주의: 이 커맨드는 예약 불가능하며, 메시지 시스템을 통해서만 실행됩니다.
 */
export class NationAcceptPeaceCommand extends GeneralCommand {
  readonly actionName = "종전 수락";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.AlwaysFail("예약 불가능 커맨드"),
    ];
    this.fullConditionConstraints = [
      ConstraintHelper.BeLord(),
      ConstraintHelper.NotBeNeutral(),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor)
      return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation)
      return {
        logs: {
          general: {
            [actorId]: ["종전 수락 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { destNationId, destGeneralId } = args;
    if (destNationId === undefined || destGeneralId === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ["종전 수락 실패: 필요한 정보가 누락되었습니다."],
          },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: {
            [actorId]: ["종전 수락 실패: 대상 국가를 찾을 수 없습니다."],
          },
        },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral || iDestGeneral.nationId !== destNationId) {
      return {
        logs: {
          general: {
            [actorId]: ["종전 수락 실패: 제의 장수가 국가 소속이 아닙니다."],
          },
        },
      };
    }

    // 외교 관계 확인
    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy =
      snapshot.diplomacy[diplomacyKey] ||
      snapshot.diplomacy[reverseDiplomacyKey];

    if (!iDiplomacy || (iDiplomacy.state !== "0" && iDiplomacy.state !== "1")) {
      return {
        logs: {
          general: {
            [actorId]: ["종전 수락 실패: 상대국과 선포, 전쟁중이지 않습니다."],
          },
        },
      };
    }

    const josaYiGeneral = JosaUtil.pick(iActor.name, "이");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");
    const josaWa = JosaUtil.pick(iDestNation.name, "와");

    // 양방향 외교 관계 설정 (state: 2 = 평화)
    return {
      diplomacy: {
        [diplomacyKey]: {
          srcNationId: iNation.id,
          destNationId: destNationId,
          state: "2",
          term: 0,
        },
        [reverseDiplomacyKey]: {
          srcNationId: destNationId,
          destNationId: iNation.id,
          state: "2",
          term: 0,
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
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】${josaWa} 종전에 합의했습니다.`],
          [destGeneralId]: [
            `【${iNation.name}】${JosaUtil.pick(iNation.name, "와")} 종전에 성공했습니다.`,
          ],
        },
        nation: {
          [iNation.id]: [`【${iDestNation.name}】${josaWa} 종전`],
          [destNationId]: [
            `【${iNation.name}】${JosaUtil.pick(iNation.name, "와")} 종전`,
          ],
        },
        global: [
          `${iActor.name}${josaYiGeneral} 【${iDestNation.name}】${josaWa} 종전 합의 하였습니다.`,
          `【종전】 ${iNation.name}${josaYiNation} 【${iDestNation.name}】${josaWa} 종전 합의 하였습니다.`,
        ],
      },
    };
  }
}
