import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 세금 조정 커맨드
 * 신규 설계 (레거시에 없음)
 *
 * 제약조건:
 * - 군주(BeLord)여야 함
 * - 중립 세력이 아니어야 함
 *
 * 세율 범위: 0-50%
 */
export class NationAdjustTaxCommand extends GeneralCommand {
  readonly actionName = "세금 조정";

  private static readonly MIN_RATE = 0;
  private static readonly MAX_RATE = 50;

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.BeLord(), ConstraintHelper.NotBeNeutral()];
    this.fullConditionConstraints = [...this.minConditionConstraints];
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
            [actorId]: ["세금 조정 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { rate } = args;
    if (rate === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ["세금 조정 실패: 세율이 지정되지 않았습니다."],
          },
        },
      };
    }

    // 세율 검증
    if (typeof rate !== "number" || !Number.isInteger(rate)) {
      return {
        logs: {
          general: { [actorId]: ["세금 조정 실패: 세율은 정수여야 합니다."] },
        },
      };
    }

    if (rate < NationAdjustTaxCommand.MIN_RATE || rate > NationAdjustTaxCommand.MAX_RATE) {
      return {
        logs: {
          general: {
            [actorId]: [
              `세금 조정 실패: 세율은 ${NationAdjustTaxCommand.MIN_RATE}%에서 ${NationAdjustTaxCommand.MAX_RATE}% 사이여야 합니다.`,
            ],
          },
        },
      };
    }

    const oldRate = iNation.rate ?? 10;
    if (oldRate === rate) {
      return {
        logs: {
          general: { [actorId]: ["세금 조정 실패: 현재 세율과 동일합니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaRo = JosaUtil.pick(`${rate}%`, "로");

    return {
      nations: {
        [iNation.id]: {
          rate: rate,
        },
      },
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            rate,
          },
        },
      },
      logs: {
        general: {
          [actorId]: [`세율을 ${oldRate}%에서 ${rate}%${josaRo} 조정했습니다.`],
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 세율을 ${rate}%${josaRo} 조정`],
        },
      },
    };
  }
}
