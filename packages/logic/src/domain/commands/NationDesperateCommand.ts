import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 필사즉생 커맨드 - 아국 모든 장수의 훈련도와 사기를 100으로 올림
 * 레거시: che_필사즉생
 * Priority: 전략 커맨드
 */
export class NationDesperateCommand extends GeneralCommand {
  readonly actionName = "필사즉생";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.AllowDiplomacyStatus([], [0], "전쟁중이 아닙니다."), // actorId 대신 nationId 사용패턴 필요
      ConstraintHelper.AvailableStrategicCommand(2), // preReqTurn = 2
      ConstraintHelper.AvailableNationCommand("NationDesperateCommand"),
    ];
  }

  // NOTE: AllowDiplomacyStatus 는 첫번째 인자로 nationId를 받도록 되어 있음. 
  // ConstraintContext.nationId 를 사용하도록 이미 구현되어 있는지 확인 필요.

  getPreReqTurn(): number {
    return 2;
  }

  getPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    return Math.round(Math.sqrt(genCount * 8) * 10);
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
          general: { [actorId]: ["필사즉생 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    // 전쟁 여부 확인
    const diplomacyInWar = Object.values(snapshot.diplomacy).some(
      (d) => (d.srcNationId === iNation.id || d.destNationId === iNation.id) && d.state === "0"
    );
    if (!diplomacyInWar) {
      return {
        logs: {
          general: { [actorId]: ["필사즉생 실패: 전쟁중이 아닙니다."] },
        },
      };
    }

    const yearMonth = snapshot.gameTime.year * 12 + snapshot.gameTime.month;
    const josaYi = JosaUtil.pick(iActor.name, "이");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const nationGenerals = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iNation.id
    );

    const generalUpdates: Record<number, any> = {};

    for (const g of nationGenerals) {
      const updates: Record<string, any> = {};
      if (g.train < 100) {
        updates.train = 100;
      }
      if (g.atmos < 100) {
        updates.atmos = 100;
      }
      if (g.id === actorId) {
        updates.experience = iActor.experience + expGain;
        updates.dedication = iActor.dedication + expGain;
        updates.lastTurn = {
          action: this.actionName,
        };
      }
      if (Object.keys(updates).length > 0) {
        generalUpdates[g.id] = updates;
      }
    }

    const postReqTurn = this.getPostReqTurn(nationGenerals.length);
    const actorAux = { ...iNation.aux };
    const actorNextExecute = { ...(actorAux.nextExecute || {}) };
    actorNextExecute["NationDesperateCommand"] = yearMonth + postReqTurn;
    actorAux.nextExecute = actorNextExecute;

    return {
      generals: generalUpdates,
      nations: {
        [iNation.id]: {
          strategicCmdLimit: 9,
          aux: actorAux,
        },
      },
      logs: {
        general: {
          [actorId]: [`${this.actionName} 발동!`],
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} ${this.actionName}을 발동`],
        },
        global: [`${iActor.name}${josaYi} ${this.actionName}을 발동하였습니다.`],
      },
    };
  }
}
