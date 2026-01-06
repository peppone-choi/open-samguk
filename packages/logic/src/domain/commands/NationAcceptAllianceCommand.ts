import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 동맹 수락 커맨드
 * 신규 설계 (레거시에 없음)
 *
 * 제약조건:
 * - 수뇌(BeChief)여야 함
 * - 중립 세력이 아니어야 함
 * - 점령 도시 필요
 * - 보급 연결 필요
 * - 대상 국가가 존재해야 함
 * - 교전중/선포중이 아니어야 함
 */
export class NationAcceptAllianceCommand extends GeneralCommand {
  readonly actionName = "동맹 수락";

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
      ConstraintHelper.ExistsDestNation(),
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
            [actorId]: ["동맹 수락 실패: 소속 국가 정보를 찾을 수 없습니다."],
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
            [actorId]: ["동맹 수락 실패: 필요한 정보가 지정되지 않았습니다."],
          },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: {
            [actorId]: ["동맹 수락 실패: 대상 국가를 찾을 수 없습니다."],
          },
        },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral) {
      return {
        logs: {
          general: {
            [actorId]: ["동맹 수락 실패: 제의 장수를 찾을 수 없습니다."],
          },
        },
      };
    }

    // 제의 장수가 대상 국가 소속인지 확인
    if (iDestGeneral.nationId !== destNationId) {
      return {
        logs: {
          general: {
            [actorId]: ["동맹 수락 실패: 제의 장수가 국가 소속이 아닙니다."],
          },
        },
      };
    }

    // 기한 검증 (이미 지난 기한인지)
    const currentMonth =
      snapshot.gameTime.year * 12 + snapshot.gameTime.month - 1;
    const reqMonth = year * 12 + month - 1;

    if (reqMonth <= currentMonth) {
      return {
        logs: {
          general: { [actorId]: ["동맹 수락 실패: 이미 기한이 지났습니다."] },
        },
      };
    }

    // 외교 관계 확인 - 교전/선포 상태면 불가
    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy =
      snapshot.diplomacy[diplomacyKey] ||
      snapshot.diplomacy[reverseDiplomacyKey];

    if (iDiplomacy) {
      if (iDiplomacy.state === "0") {
        return {
          logs: {
            general: {
              [actorId]: ["동맹 수락 실패: 아국과 이미 교전중입니다."],
            },
          },
        };
      }
      if (iDiplomacy.state === "1") {
        return {
          logs: {
            general: {
              [actorId]: ["동맹 수락 실패: 아국과 이미 선포중입니다."],
            },
          },
        };
      }
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaWa = JosaUtil.pick(iNation.name, "와");
    const termMonths = reqMonth - currentMonth;

    // 양방향 외교 관계 설정 (state: 8 = 동맹)
    return {
      diplomacy: {
        [diplomacyKey]: {
          srcNationId: iNation.id,
          destNationId: destNationId,
          state: "8",
          term: termMonths,
        },
        [reverseDiplomacyKey]: {
          srcNationId: destNationId,
          destNationId: iNation.id,
          state: "8",
          term: termMonths,
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
          [actorId]: [`【${iDestNation.name}】${josaWa} 동맹을 체결했습니다.`],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYi} 【${iDestNation.name}】${josaWa} ${year}년 ${month}월까지 동맹 체결`,
          ],
          [destNationId]: [
            `【${iNation.name}】의 ${iActor.name}${josaYi} 동맹 수락`,
          ],
        },
        global: [
          `【동맹】 ${iNation.name}${josaWa} 【${iDestNation.name}】${josaYi} ${year}년 ${month}월까지 동맹을 체결했습니다.`,
        ],
      },
    };
  }
}
