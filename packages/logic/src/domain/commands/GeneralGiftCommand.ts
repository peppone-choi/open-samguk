import { RandUtil } from "@sammo/common";
import { GameConst } from "../GameConst.js";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 증여 커맨드
 * 레거시: che_증여
 */
export class GeneralGiftCommand extends GeneralCommand {
  readonly actionName = "증여";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
    ];
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
    args: Record<string, any>
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`증여 실패: ${check.reason}`],
          },
        },
      };
    }

    const { isGold, amount, destGeneralId } = args;
    if (amount === undefined || amount <= 0 || !destGeneralId) {
      return {
        logs: {
          general: {
            [actorId]: ["증여 실패: 수량 또는 대상 장수가 올바르지 않습니다."],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iDestGeneral = snapshot.generals[destGeneralId];
    const resKey = isGold ? "gold" : "rice";
    const resName = isGold ? "금" : "쌀";
    const minRes = isGold ? GameConst.generalMinimumGold : GameConst.generalMinimumRice;

    const actualAmount = Math.min(amount, iGeneral[resKey] - minRes);
    if (actualAmount < 100) {
      return {
        logs: {
          general: {
            [actorId]: [`증여 실패: 여유 ${resName}이 부족합니다. (최소 100 이상 필요)`],
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
        [destGeneralId]: {
          [resKey]: iDestGeneral[resKey] + actualAmount,
        },
      },
      logs: {
        general: {
          [actorId]: [
            `${iDestGeneral.name}에게 ${resName} ${actualAmount.toLocaleString()}을 증여했습니다.`,
          ],
          [destGeneralId]: [
            `${iGeneral.name}에게서 ${resName} ${actualAmount.toLocaleString()}을 증여받았습니다.`,
          ],
        },
      },
    };
  }
}
