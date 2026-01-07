import { RandUtil } from "@sammo/common";
import { GameConst } from "../GameConst.js";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 헌납 커맨드
 * 레거시: che_헌납
 */
export class GeneralDonateCommand extends GeneralCommand {
  readonly actionName = "헌납";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
    ];
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
            [actorId]: [`헌납 실패: ${check.reason}`],
          },
        },
      };
    }

    const { isGold, amount } = args;
    if (amount === undefined || amount <= 0) {
      return {
        logs: {
          general: {
            [actorId]: ["헌납 실패: 수량이 올바르지 않습니다."],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) {
      return {
        logs: {
          general: {
            [actorId]: ["헌납 실패: 장수 정보를 찾을 수 없습니다."],
          },
        },
      };
    }

    const resKey = isGold ? "gold" : "rice";
    const resName = isGold ? "금" : "쌀";

    const actualAmount = Math.min(amount, iGeneral[resKey]);
    if (actualAmount < 100) {
      return {
        logs: {
          general: {
            [actorId]: [`헌납 실패: 최소 100 이상의 ${resName}이 필요합니다.`],
          },
        },
      };
    }

    const iNation = snapshot.nations[iGeneral.nationId];
    if (!iNation) {
      return {
        logs: {
          general: {
            [actorId]: ["헌납 실패: 국가 정보를 찾을 수 없습니다."],
          },
        },
      };
    }

    return {
      generals: {
        [actorId]: {
          [resKey]: iGeneral[resKey] - actualAmount,
          experience: iGeneral.experience + 70,
          dedication: iGeneral.dedication + 100,
          leadershipExp: iGeneral.leadershipExp + 1,
        },
      },
      nations: {
        [iGeneral.nationId]: {
          [resKey]: iNation[resKey] + actualAmount,
        },
      },
      logs: {
        general: {
          [actorId]: [`${resName} ${actualAmount.toLocaleString()}을 헌납했습니다.`],
        },
      },
    };
  }
}
