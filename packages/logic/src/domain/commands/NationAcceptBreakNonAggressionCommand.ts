import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

export class NationAcceptBreakNonAggressionCommand extends GeneralCommand {
  readonly actionName = "불가침 파기 수락";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.BeChief(), ConstraintHelper.NotBeNeutral()];
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
          general: { [actorId]: ["불가침 파기 수락 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destNationId, destGeneralId } = args;
    if (destNationId === undefined || destGeneralId === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ["불가침 파기 수락 실패: 대상 국가 또는 장수가 지정되지 않았습니다."],
          },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["불가침 파기 수락 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral) {
      return {
        logs: {
          general: { [actorId]: ["불가침 파기 수락 실패: 제의 장수를 찾을 수 없습니다."] },
        },
      };
    }

    if (iDestGeneral.nationId !== destNationId) {
      return {
        logs: {
          general: { [actorId]: ["불가침 파기 수락 실패: 제의 장수가 국가 소속이 아닙니다."] },
        },
      };
    }

    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (!iDiplomacy || iDiplomacy.state !== "7") {
      return {
        logs: {
          general: { [actorId]: ["불가침 파기 수락 실패: 불가침 중인 상대국에게만 가능합니다."] },
        },
      };
    }

    const josaYiGeneral = JosaUtil.pick(iActor.name, "이");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");
    const josaWa = JosaUtil.pick(iDestNation.name, "와");
    const josaWaNation = JosaUtil.pick(iNation.name, "와");

    return {
      diplomacy: {
        [diplomacyKey]: {
          state: "2",
          term: 0,
        },
        [reverseDiplomacyKey]: {
          state: "2",
          term: 0,
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】${josaWa}의 불가침을 파기했습니다.`],
          [destGeneralId]: [`【${iNation.name}】${josaWaNation}의 불가침 파기에 성공했습니다.`],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYiGeneral} 【${iDestNation.name}】${josaWa}의 불가침 파기 수락`,
          ],
          [destNationId]: [`【${iNation.name}】${josaWaNation}의 불가침 파기 성공`],
        },
        global: [
          `${iActor.name}${josaYiGeneral} 【${iDestNation.name}】${josaWa}의 불가침 조약을 파기하였습니다.`,
        ],
      },
    };
  }
}
