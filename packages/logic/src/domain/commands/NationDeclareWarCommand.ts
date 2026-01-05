import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { areNationsNeighbors } from "../constraints/NearNationConstraint.js";

/**
 * 선전포고 커맨드
 * 레거시: che_선전포고
 *
 * 제약조건:
 * - 수뇌(BeChief)여야 함
 * - 중립 세력이 아니어야 함
 * - 점령 도시 필요
 * - 보급 연결 필요
 * - 게임 시작 2년 후부터 가능
 * - 대상 국가가 존재해야 함
 * - 인접 국가여야 함
 * - 이미 교전/선포/불가침 상태가 아니어야 함
 */
export class NationDeclareWarCommand extends GeneralCommand {
  readonly actionName = "선전포고";

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
      ConstraintHelper.DifferentDestNation(),
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
            [actorId]: ["선전포고 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { destNationId } = args;
    if (destNationId === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ["선전포고 실패: 대상 국가가 지정되지 않았습니다."],
          },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: {
            [actorId]: ["선전포고 실패: 대상 국가를 찾을 수 없습니다."],
          },
        },
      };
    }

    if (iDestNation.id === 0) {
      return {
        logs: {
          general: {
            [actorId]: [
              "선전포고 실패: 중립 세력에게는 선전포고할 수 없습니다.",
            ],
          },
        },
      };
    }

    if (iDestNation.id === iNation.id) {
      return {
        logs: {
          general: {
            [actorId]: ["선전포고 실패: 자국에게는 선전포고할 수 없습니다."],
          },
        },
      };
    }

    // 초반제한 체크 (게임 시작 2년 후부터 가능)
    const startYear = snapshot.env.startyear ?? snapshot.gameTime.year;
    if (snapshot.gameTime.year < startYear + 1) {
      return {
        logs: {
          general: {
            [actorId]: ["선전포고 실패: 초반제한 해제 2년전부터 가능합니다."],
          },
        },
      };
    }

    // 인접국 체크
    if (!areNationsNeighbors(iNation.id, destNationId, snapshot.cities)) {
      return {
        logs: {
          general: { [actorId]: ["선전포고 실패: 인접 국가가 아닙니다."] },
        },
      };
    }

    // 외교 관계 확인
    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy =
      snapshot.diplomacy[diplomacyKey] ||
      snapshot.diplomacy[reverseDiplomacyKey];

    // state 0: 전쟁, 1: 선포, 7: 불가침
    if (iDiplomacy) {
      if (iDiplomacy.state === "0") {
        return {
          logs: {
            general: {
              [actorId]: ["선전포고 실패: 아국과 이미 교전중입니다."],
            },
          },
        };
      }
      if (iDiplomacy.state === "1") {
        return {
          logs: {
            general: {
              [actorId]: ["선전포고 실패: 아국과 이미 선포중입니다."],
            },
          },
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

    // 양방향 외교 관계 설정 (state: 1 = 선포, term: 24 = 24턴)
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
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】에 선전 포고 했습니다.`],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYi} 【${iDestNation.name}】에 선전 포고`,
          ],
          [destNationId]: [
            `【${iNation.name}】의 ${iActor.name}${josaYi} 아국에 선전 포고`,
          ],
        },
        global: [
          `${iActor.name}${josaYi} 【${iDestNation.name}】에 선전 포고 하였습니다.`,
          `【선포】 ${iNation.name}${josaYiNation} 【${iDestNation.name}】에 선전 포고 하였습니다.`,
        ],
      },
    };
  }
}
