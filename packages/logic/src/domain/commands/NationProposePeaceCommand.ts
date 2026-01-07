import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta, Message } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 종전 제의 커맨드
 * 레거시: che_종전제의
 */
export class NationProposePeaceCommand extends GeneralCommand {
  readonly actionName = "종전 제의";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
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
            [actorId]: ["종전 제의 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };

    const { destNationId } = args;
    if (destNationId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["종전 제의 실패: 대상 국가가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: { general: { [actorId]: ["종전 제의 실패: 대상 국가를 찾을 수 없습니다."] } },
      };
    }

    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (!iDiplomacy || (iDiplomacy.state !== "0" && iDiplomacy.state !== "1")) {
      return {
        logs: {
          general: { [actorId]: ["종전 제의 실패: 선포, 전쟁중인 상대국에게만 가능합니다."] },
        },
      };
    }

    const josaRo = JosaUtil.pick(iDestNation.name, "로");

    const message: Message = {
      id: Date.now(),
      mailbox: `nation:${destNationId}`,
      srcId: actorId,
      destId: null,
      text: `【외교】${iNation.name}에서 종전 제의 서신을 보냈습니다.`,
      sentAt: new Date(),
      meta: {
        type: "diplomacy",
        action: "propose_peace",
        srcNationId: iNation.id,
        destNationId: destNationId,
        srcGeneralId: actorId,
      },
    };

    return {
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destNationId,
          },
        },
      },
      messages: [message],
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】${josaRo} 종전 제의 서신을 보냈습니다.`],
        },
      },
    };
  }
}
