import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 물자원조 커맨드
 * 레거시: che_물자원조
 */
export class NationAidCommand extends GeneralCommand {
  readonly actionName = "원조";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.ReqNationValue("surrenderLimit", "외교제한", "==", 0, "외교제한중입니다."),
      ConstraintHelper.AvailableStrategicCommand(0),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestNation(),
      ConstraintHelper.DifferentDestNation(),
      ConstraintHelper.ReqDestNationValue("surrenderLimit", "외교제한", "==", 0, "상대국이 외교제한중입니다."),
    ];
  }

  getPreReqTurn(): number {
    return 0;
  }

  getPostReqTurn(): number {
    return 12;
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
            [actorId]: ["원조 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { destNationId, amountList } = args;
    if (destNationId === undefined || !amountList || !Array.isArray(amountList)) {
      return {
        logs: {
          general: {
            [actorId]: ["원조 실패: 대상 국가 또는 원조량이 지정되지 않았습니다."],
          },
        },
      };
    }

    const [goldAmount, riceAmount] = amountList;

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["원조 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    const limit = iNation.level * GameConst.coefAidAmount;
    if (goldAmount > limit || riceAmount > limit) {
      return {
        logs: {
          general: {
            [actorId]: [`원조 실패: 작위 제한량(${limit})을 초과했습니다.`],
          },
        },
      };
    }

    // 실제 가능한 원조량 계산
    const actualGold = Math.min(goldAmount, iNation.gold - GameConst.minNationalGold);
    const actualRice = Math.min(riceAmount, iNation.rice - GameConst.minNationalRice);

    if (actualGold < 0 || actualRice < 0) {
      return {
        logs: { general: { [actorId]: ["원조 실패: 자원이 부족합니다."] } },
      };
    }

    const goldAmountText = actualGold.toLocaleString();
    const riceAmountText = actualRice.toLocaleString();
    const josaRo = JosaUtil.pick(iDestNation.name, "로");
    const josaUlRiceAmount = JosaUtil.pick(riceAmountText, "을");

    const recvAssist = { ...(iDestNation.meta?.recv_assist || {}) };
    recvAssist[`n${iNation.id}`] = [
      iNation.id,
      (recvAssist[`n${iNation.id}`]?.[1] || 0) + actualGold + actualRice,
    ];

    return {
      nations: {
        [iNation.id]: {
          gold: iNation.gold - actualGold,
          rice: iNation.rice - actualRice,
          surrenderLimit: (iNation.surrenderLimit || 0) + this.getPostReqTurn(),
        },
        [destNationId]: {
          gold: iDestNation.gold + actualGold,
          rice: iDestNation.rice + actualRice,
          meta: {
            ...iDestNation.meta,
            recv_assist: recvAssist,
          },
        },
      },
      generals: {
        [actorId]: {
          experience: iActor.experience + 5,
          dedication: iActor.dedication + 5,
          lastTurn: {
            action: this.actionName,
            destNationId,
            amountList: [actualGold, actualRice],
          },
        },
      },
      logs: {
        general: {
          [actorId]: [
            `【${iDestNation.name}】${josaRo} 금 ${goldAmountText}, 쌀 ${riceAmountText}을 지원했습니다.`,
            `【${iDestNation.name}】${josaRo} 물자를 지원합니다.`,
          ],
        },
        nation: {
          [iNation.id]: [
            `【${iDestNation.name}】${josaRo} 금 ${goldAmountText}, 쌀 ${riceAmountText}${josaUlRiceAmount} 지원`,
          ],
          [destNationId]: [
            `【${iNation.name}】${JosaUtil.pick(iNation.name, "로")}부터 금 ${goldAmountText}, 쌀 ${riceAmountText}${josaUlRiceAmount} 지원 받음`,
          ],
        },
        global: [`【원조】 ${iNation.name}에서 【${iDestNation.name}】${josaRo} 물자를 지원합니다`],
      },
    };
  }
}
