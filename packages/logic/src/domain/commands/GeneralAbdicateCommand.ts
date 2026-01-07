import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 선양 커맨드 - 군주가 다른 장수에게 군주 자리를 넘김
 * 레거시: che_선양
 *
 * 조건: 군주만 실행 가능, 대상 장수가 같은 국가 소속이어야 함
 * 효과: 군주 교체, 경험치 30% 감소
 */
export class GeneralAbdicateCommand extends GeneralCommand {
  readonly actionName = "선양";

  // 군주 불가 페널티 키들
  private static readonly PENALTY_KEYS = ["NoChief", "NoFoundNation", "NoAmbassador"];

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.BeLord()];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestGeneral(),
      ConstraintHelper.FriendlyDestGeneral(),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, unknown>
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`선양 실패: ${check.reason}`],
          },
        },
      };
    }

    const destGeneralId = args.destGeneralId as number;
    if (!destGeneralId) {
      return {
        logs: {
          general: {
            [actorId]: ["선양 실패: 대상 장수가 지정되지 않았습니다."],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const destGeneral = snapshot.generals[destGeneralId];
    const iNation = snapshot.nations[iGeneral.nationId];

    if (!iGeneral || !destGeneral || !iNation) {
      return {
        logs: {
          general: { [actorId]: ["선양 실패: 정보를 찾을 수 없습니다."] },
        },
      };
    }

    if (destGeneral.nationId !== iGeneral.nationId) {
      return {
        logs: {
          general: { [actorId]: ["선양 실패: 같은 국가의 장수가 아닙니다."] },
        },
      };
    }

    // 페널티 체크 (NoChief, NoFoundNation, NoAmbassador)
    const destPenalty = destGeneral.penalty ?? {};
    for (const penaltyKey of GeneralAbdicateCommand.PENALTY_KEYS) {
      if (destPenalty[penaltyKey]) {
        return {
          logs: {
            general: { [actorId]: ["선양 실패: 선양할 수 없는 장수입니다."] },
          },
        };
      }
    }

    const generalName = iGeneral.name;
    const destGeneralName = destGeneral.name;
    const nationName = iNation.name;

    const josaYi = JosaUtil.pick(generalName, "이");

    return {
      generals: {
        [actorId]: {
          officerLevel: 1,
          officerCity: 0,
          experience: Math.floor(iGeneral.experience * 0.7), // 경험치 30% 감소
        },
        [destGeneralId]: {
          officerLevel: 12, // 군주
          officerCity: 0,
        },
      },
      nations: {
        [iGeneral.nationId]: {
          chiefGeneralId: destGeneralId,
        },
      },
      logs: {
        general: {
          [actorId]: [`${destGeneralName}에게 군주의 자리를 물려줍니다.`],
          [destGeneralId]: [`${generalName}에게서 군주의 자리를 물려받습니다.`],
        },
        nation: {
          [iGeneral.nationId]: [`${generalName}${josaYi} ${destGeneralName}에게 선양`],
        },
        global: [
          `【선양】${generalName}${josaYi} ${nationName}의 군주 자리를 ${destGeneralName}에게 선양했습니다.`,
        ],
      },
    };
  }
}
