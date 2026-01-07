import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 이호경식 커맨드 - 적국과의 외교 상태를 선포로 변경하고 기간을 3개월로 설정
 * 레거시: che_이호경식
 * Priority: 전략 커맨드
 */
export class NationEconomicWarfareCommand extends GeneralCommand {
  readonly actionName = "이호경식";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.AvailableStrategicCommand(0), // preReqTurn = 0
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestNation(),
      ConstraintHelper.AllowDiplomacyBetweenStatus(
        [0, 1],
        "선포, 전쟁중인 상대국에게만 가능합니다."
      ),
    ];
  }

  getPreReqTurn(): number {
    return 0;
  }

  getPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    return Math.round(Math.sqrt(genCount * 16) * 10);
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: ["이호경식 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destNationId } = args;
    if (destNationId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["이호경식 실패: 대상 국가가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["이호경식 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (!iDiplomacy || (iDiplomacy.state !== "0" && iDiplomacy.state !== "1")) {
      return {
        logs: {
          general: { [actorId]: ["이호경식 실패: 선포 또는 전쟁중인 상대국에게만 가능합니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");
    const josaUl = JosaUtil.pick(this.actionName, "을");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const newTerm = iDiplomacy.state === "0" ? 3 : iDiplomacy.term + 3;

    return {
      generals: {
        [actorId]: {
          experience: iActor.experience + expGain,
          dedication: iActor.dedication + expGain,
          lastTurn: {
            action: this.actionName,
            destNationId,
          },
        },
      },
      diplomacy: {
        [diplomacyKey]: {
          srcNationId: iNation.id,
          destNationId,
          state: "1",
          term: newTerm,
        },
        [reverseDiplomacyKey]: {
          srcNationId: destNationId,
          destNationId: iNation.id,
          state: "1",
          term: newTerm,
        },
      },
      nations: {
        [iNation.id]: {
          strategicCmdLimit: 9,
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】에 ${this.actionName}${josaUl} 발동!`],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYi} 【${iDestCity.name}】에 ${this.actionName}${josaUl} 발동`,
          ],
          [destNationId]: [
            `【${iNation.name}】${josaYiNation} 아국에 ${this.actionName}${josaUl} 발동`,
          ],
        },
      },
    };
  }
}
