import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 장수대상임관 커맨드 - 특정 장수를 따라 임관
 * 레거시: che_장수대상임관
 */
export class GeneralFollowJoinCommand extends GeneralCommand {
  readonly actionName = "장수를 따라 임관";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.BeNeutral()];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`장수대상임관 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destGeneralId } = args;
    if (!destGeneralId) {
      return {
        logs: {
          general: {
            [actorId]: ["장수대상임관 실패: 대상 장수가 지정되지 않았습니다."],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const destGeneral = snapshot.generals[destGeneralId];

    if (!destGeneral) {
      return {
        logs: {
          general: {
            [actorId]: ["장수대상임관 실패: 존재하지 않는 장수입니다."],
          },
        },
      };
    }

    if (destGeneral.nationId === 0) {
      return {
        logs: {
          general: {
            [actorId]: ["장수대상임관 실패: 대상 장수가 재야입니다."],
          },
        },
      };
    }

    const destNation = snapshot.nations[destGeneral.nationId];
    if (!destNation) {
      return {
        logs: {
          general: {
            [actorId]: ["장수대상임관 실패: 국가가 존재하지 않습니다."],
          },
        },
      };
    }

    const exp = 100; // 기본 경험치

    return {
      generals: {
        [actorId]: {
          nationId: destGeneral.nationId,
          cityId: destGeneral.cityId,
          officerLevel: 1,
          experience: iGeneral.experience + exp,
        },
      },
      logs: {
        general: {
          [actorId]: [`${destGeneral.name}을(를) 따라 ${destNation.name}에 임관했습니다.`],
        },
        global: [
          `${iGeneral.name} 장수가 ${destGeneral.name}을(를) 따라 ${destNation.name}에 임관했습니다.`,
        ],
      },
    };
  }
}
