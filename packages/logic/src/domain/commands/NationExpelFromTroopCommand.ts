import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

export class NationExpelFromTroopCommand extends GeneralCommand {
  readonly actionName = "부대 탈퇴 지시";

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
          general: { [actorId]: ["부대 탈퇴 지시 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destGeneralId } = args;
    if (destGeneralId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["부대 탈퇴 지시 실패: 대상 장수가 지정되지 않았습니다."] },
        },
      };
    }

    if (destGeneralId === actorId) {
      return {
        logs: {
          general: { [actorId]: ["부대 탈퇴 지시 실패: 본인입니다."] },
        },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];
    if (!iDestGeneral) {
      return {
        logs: {
          general: { [actorId]: ["부대 탈퇴 지시 실패: 대상 장수를 찾을 수 없습니다."] },
        },
      };
    }

    if (iDestGeneral.nationId !== iNation.id) {
      return {
        logs: {
          general: { [actorId]: ["부대 탈퇴 지시 실패: 같은 국가 소속이 아닙니다."] },
        },
      };
    }

    const troopId = iDestGeneral.troopId;
    if (troopId === 0) {
      const josaUn = JosaUtil.pick(iDestGeneral.name, "은");
      return {
        generals: {
          [actorId]: {
            lastTurn: {
              action: this.actionName,
              destGeneralId,
            },
          },
        },
        logs: {
          general: { [actorId]: [`【${iDestGeneral.name}】${josaUn} 부대원이 아닙니다.`] },
          nation: {},
          global: [],
        },
      };
    }

    if (troopId === destGeneralId) {
      const josaUn = JosaUtil.pick(iDestGeneral.name, "은");
      return {
        generals: {
          [actorId]: {
            lastTurn: {
              action: this.actionName,
              destGeneralId,
            },
          },
        },
        logs: {
          general: { [actorId]: [`【${iDestGeneral.name}】${josaUn} 부대장입니다.`] },
          nation: {},
          global: [],
        },
      };
    }

    return {
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destGeneralId,
          },
        },
        [destGeneralId]: {
          troopId: 0,
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestGeneral.name}】에게 부대 탈퇴를 지시했습니다.`],
          [destGeneralId]: [`【${iActor.name}】에게 부대 탈퇴를 지시 받았습니다.`],
        },
        nation: {},
        global: [],
      },
    };
  }
}
