import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 불가침 수락 커맨드
 * 레거시: che_불가침수락
 *
 * 주의: 이 커맨드는 예약 불가능하며, 메시지 시스템을 통해서만 실행됩니다.
 */
export class NationAcceptNonAggressionCommand extends GeneralCommand {
  readonly actionName = "불가침 수락";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.AlwaysFail("예약 불가능 커맨드")];
    this.fullConditionConstraints = [
      ConstraintHelper.BeLord(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
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
        logs: {
          general: {
            [actorId]: ["불가침 수락 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { destNationId, destGeneralId, year, month } = args;
    if (
      destNationId === undefined ||
      destGeneralId === undefined ||
      year === undefined ||
      month === undefined
    ) {
      return {
        logs: {
          general: {
            [actorId]: ["불가침 수락 실패: 필요한 정보가 누락되었습니다."],
          },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: {
            [actorId]: ["불가침 수락 실패: 대상 국가를 찾을 수 없습니다."],
          },
        },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral || iDestGeneral.nationId !== destNationId) {
      return {
        logs: {
          general: {
            [actorId]: ["불가침 수락 실패: 제의 장수가 국가 소속이 아닙니다."],
          },
        },
      };
    }

    // 기한 검증
    const currentMonth = snapshot.gameTime.year * 12 + snapshot.gameTime.month - 1;
    const reqMonth = year * 12 + month;

    if (reqMonth <= currentMonth) {
      return {
        logs: {
          general: { [actorId]: ["불가침 수락 실패: 이미 기한이 지났습니다."] },
        },
      };
    }

    // 외교 관계 확인
    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (iDiplomacy) {
      if (iDiplomacy.state === "0") {
        return {
          logs: {
            general: {
              [actorId]: ["불가침 수락 실패: 아국과 이미 교전중입니다."],
            },
          },
        };
      }
      if (iDiplomacy.state === "1") {
        return {
          logs: {
            general: {
              [actorId]: ["불가침 수락 실패: 아국과 이미 선포중입니다."],
            },
          },
        };
      }
    }

    const termMonths = reqMonth - currentMonth;
    const josaWa = JosaUtil.pick(iDestNation.name, "와");

    // 양방향 외교 관계 설정 (state: 7 = 불가침)
    return {
      diplomacy: {
        [diplomacyKey]: {
          srcNationId: iNation.id,
          destNationId: destNationId,
          state: "7",
          term: termMonths,
        },
        [reverseDiplomacyKey]: {
          srcNationId: destNationId,
          destNationId: iNation.id,
          state: "7",
          term: termMonths,
        },
      },
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destNationId,
            year,
            month,
          },
        },
      },
      logs: {
        general: {
          [actorId]: [
            `【${iDestNation.name}】${josaWa} ${year}년 ${month}월까지 불가침에 성공했습니다.`,
          ],
          [destGeneralId]: [
            `【${iNation.name}】${JosaUtil.pick(iNation.name, "와")} ${year}년 ${month}월까지 불가침에 성공했습니다.`,
          ],
        },
      },
    };
  }
}
