import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 급습 커맨드 - 선포중인 적국과의 외교 기간을 3개월 단축
 * 레거시: che_급습
 * Priority: 전략 커맨드
 */
export class NationRaidCommand extends GeneralCommand {
  readonly actionName = "급습";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.AvailableStrategicCommand(0), // preReqTurn = 0
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestNation(),
      ConstraintHelper.AllowDiplomacyStatus([], [1], "선포중인 국가에만 급습할 수 있습니다."),
      ConstraintHelper.AvailableStrategicCommand(0),
    ];
  }

  getPreReqTurn(): number {
    return 0;
  }

  getPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    // sqrt(genCount * 16) * 10
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
          general: { [actorId]: ["급습 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destNationId } = args;
    if (destNationId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["급습 실패: 대상 국가가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["급습 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (!iDiplomacy || iDiplomacy.state !== "1") {
      return {
        logs: {
          general: { [actorId]: ["급습 실패: 선포중인 국가에만 급습할 수 있습니다."] },
        },
      };
    }

    if (iDiplomacy.term < 12) {
      return {
        logs: {
          general: { [actorId]: ["급습 실패: 선포 12개월 이상인 상대국에만 가능합니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaUl = JosaUtil.pick(this.actionName, "을");
    const expGain = 5;

    const newTerm = Math.max(0, iDiplomacy.term - 3);

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
          ...iDiplomacy,
          term: newTerm,
        },
        [reverseDiplomacyKey]: {
          srcNationId: destNationId,
          destNationId: iNation.id,
          state: iDiplomacy.state,
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
          [actorId]: [`【${iDestNation.name}】에 ${this.actionName}${josaUl} 발동했습니다.`],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYi} 【${iDestNation.name}】에 ${this.actionName}${josaUl} 발동`,
          ],
          [destNationId]: [
            `【${iNation.name}】의 ${iActor.name}${josaYi} 아국에 ${this.actionName}${josaUl} 발동`,
          ],
        },
        global: [
          `${iActor.name}${josaYi} 【${iDestNation.name}】에 ${this.actionName}${josaUl} 발동하였습니다.`,
        ],
      },
    };
  }
}
