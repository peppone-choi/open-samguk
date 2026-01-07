import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 포상 커맨드
 * 레거시: che_포상
 */
export class NationRewardCommand extends GeneralCommand {
  readonly actionName = "포상";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
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
    const iActor = snapshot.generals[actorId];
    if (!iActor) return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation)
      return {
        logs: { general: { [actorId]: ["포상 실패: 소속 국가 정보를 찾을 수 없습니다."] } },
      };

    const { destGeneralId, amount, isGold } = args;
    if (destGeneralId === undefined || amount === undefined || isGold === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ["포상 실패: 대상 장수, 금액 또는 종류가 지정되지 않았습니다."],
          },
        },
      };
    }

    if (destGeneralId === actorId) {
      return {
        logs: { general: { [actorId]: ["포상 실패: 본인에게는 포상할 수 없습니다."] } },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral) {
      return {
        logs: { general: { [actorId]: ["포상 실패: 대상 장수를 찾을 수 없습니다."] } },
      };
    }

    if (iDestGeneral.nationId !== iNation.id) {
      return {
        logs: { general: { [actorId]: ["포상 실패: 타국 장수에게는 포상할 수 없습니다."] } },
      };
    }

    const resKey = isGold ? "gold" : "rice";
    const resName = isGold ? "금" : "쌀";
    const baseLimit = isGold ? GameConst.minNationalGold : GameConst.minNationalRice;

    const actualAmount = Math.min(
      Math.max(0, Math.round(amount / 100) * 100),
      iNation[resKey] - baseLimit
    );

    if (actualAmount <= 0) {
      return {
        logs: { general: { [actorId]: ["포상 실패: 포상할 자금이 부족합니다."] } },
      };
    }

    const amountText = actualAmount.toLocaleString();
    const josaUl = JosaUtil.pick(amountText, "을");
    const date = snapshot.gameTime.year * 12 + snapshot.gameTime.month; // 실제 시간 포맷팅은 시스템에 따라 다름

    return {
      nations: {
        [iNation.id]: {
          [resKey]: iNation[resKey] - actualAmount,
        },
      },
      generals: {
        [actorId]: {
          experience: iActor.experience + 5,
          dedication: iActor.dedication + 5,
          lastTurn: {
            action: this.actionName,
            destGeneralId,
            amount: actualAmount,
            isGold,
          },
        },
        [destGeneralId]: {
          [resKey]: iDestGeneral[resKey] + actualAmount,
        },
      },
      logs: {
        general: {
          [actorId]: [
            `【${iDestGeneral.name}】에게 ${resName} ${amountText}${josaUl} 수여했습니다.`,
          ],
          [destGeneralId]: [`${resName} ${amountText}${josaUl} 포상으로 받았습니다.`],
        },
      },
    };
  }
}
