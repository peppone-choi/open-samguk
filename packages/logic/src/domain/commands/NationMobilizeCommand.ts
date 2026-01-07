import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 백성동원 커맨드 - 도시 수비와 성벽을 80%까지 회복
 * 레거시: che_백성동원
 * Priority: 전략 커맨드
 */
export class NationMobilizeCommand extends GeneralCommand {
  readonly actionName = "백성동원";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.AvailableStrategicCommand(0), // preReqTurn = 0
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.OccupiedDestCity(),
    ];
  }

  getPreReqTurn(): number {
    return 0;
  }

  getPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    // sqrt(genCount * 4) * 10
    return Math.round(Math.sqrt(genCount * 4) * 10);
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
          general: { [actorId]: ["백성동원 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destCityId } = args;
    if (destCityId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["백성동원 실패: 대상 도시가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity) {
      return {
        logs: {
          general: { [actorId]: ["백성동원 실패: 대상 도시를 찾을 수 없습니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const nationGeneralsCount = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iNation.id
    ).length;

    const newDef = Math.max(iDestCity.def, Math.floor(iDestCity.defMax * 0.8));
    const newWall = Math.max(iDestCity.wall, Math.floor(iDestCity.wallMax * 0.8));

    const broadcastMessage = `<Y>${iActor.name}</>${josaYi} <G><b>${iDestCity.name}</b></>에 <M>백성동원</>을 하였습니다.`;
    const nationGeneralLogs: Record<number, string[]> = {};
    Object.values(snapshot.generals)
      .filter((g) => g.nationId === iNation.id && g.id !== actorId)
      .forEach((g) => {
        nationGeneralLogs[g.id] = [broadcastMessage];
      });

    return {
      generals: {
        [actorId]: {
          experience: iActor.experience + expGain,
          dedication: iActor.dedication + expGain,
          lastTurn: {
            action: this.actionName,
            destCityId,
          },
        },
      },
      cities: {
        [destCityId]: {
          def: newDef,
          wall: newWall,
        },
      },
      nations: {
        [iNation.id]: {
          strategicCmdLimit: 9,
        },
      },
      logs: {
        general: {
          [actorId]: [`${this.actionName} 발동!`],
          ...nationGeneralLogs,
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 【${iDestCity.name}】에 ${this.actionName} 발동`],
        },
      },
    };
  }
}
