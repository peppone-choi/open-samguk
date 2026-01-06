import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 임관 커맨드
 * 레거시: che_임관
 */
export class GeneralJoinNationCommand extends GeneralCommand {
  readonly actionName = "임관";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.BeNeutral()];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`임관 실패: ${check.reason}`],
          },
        },
      };
    }

    const { nationId } = args;
    if (!nationId) {
      return {
        logs: {
          general: { [actorId]: ["임관 실패: 국가가 지정되지 않았습니다."] },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iNation = snapshot.nations[nationId];

    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: ["임관 실패: 존재하지 않는 국가입니다."] },
        },
      };
    }

    return {
      generals: {
        [actorId]: {
          nationId: nationId,
          officerLevel: 0,
          experience: iGeneral.experience + 100,
          dedication: 100,
        },
      },
      logs: {
        general: {
          [actorId]: [`${iNation.name}에 임관했습니다.`],
        },
        global: [`${iGeneral.name} 장수가 ${iNation.name}에 임관했습니다.`],
      },
    };
  }
}
