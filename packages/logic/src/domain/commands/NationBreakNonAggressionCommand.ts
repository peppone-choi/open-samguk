import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

export class NationBreakNonAggressionCommand extends GeneralCommand {
  readonly actionName = "불가침 파기 제의";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.SuppliedCity(),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  getPreReqTurn(): number {
    return 0;
  }

  getPostReqTurn(): number {
    return 0;
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
          general: { [actorId]: ["불가침 파기 제의 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destNationId } = args;
    if (destNationId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["불가침 파기 제의 실패: 대상 국가가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["불가침 파기 제의 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (!iDiplomacy || iDiplomacy.state !== "7") {
      return {
        logs: {
          general: { [actorId]: ["불가침 파기 제의 실패: 불가침 중인 상대국에게만 가능합니다."] },
        },
      };
    }

    const josaRo = JosaUtil.pick(iDestNation.name, "로");

    return {
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destNationId,
          },
        },
      },
      env: {
        pendingDiplomaticProposal: {
          type: "breakNonAggression",
          srcNationId: iNation.id,
          destNationId,
          srcGeneralId: actorId,
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】${josaRo} 불가침 파기 제의 서신을 보냈습니다.`],
        },
        nation: {},
        global: [],
      },
    };
  }
}
