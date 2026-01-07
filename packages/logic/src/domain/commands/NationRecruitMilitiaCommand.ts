import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 의병모집 커맨드 - 아국 도시에 의병(NPC)을 모집
 * 레거시: che_의병모집
 * Priority: 전략 커맨드
 */
export class NationRecruitMilitiaCommand extends GeneralCommand {
  readonly actionName = "의병모집";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.AvailableStrategicCommand(2), // preReqTurn = 2
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  getPreReqTurn(): number {
    return 2;
  }

  getPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    return Math.round(Math.sqrt(genCount * 10) * 10);
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
          general: { [actorId]: ["의병모집 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaUl = JosaUtil.pick(this.actionName, "을");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const nationGenerals = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iNation.id
    );

    const activeNations = Object.values(snapshot.nations).filter((n) => n.level > 0);
    const totalGenerals = Object.values(snapshot.generals).filter((g) =>
      activeNations.some((n) => n.id === g.nationId)
    ).length;
    const avgGenCount = activeNations.length > 0 ? totalGenerals / activeNations.length : 0;

    const createGenCount = 3 + Math.round(avgGenCount / 8);

    const avgStats = nationGenerals.reduce(
      (acc, g) => ({
        dedication: acc.dedication + (g.dedication || 0),
        experience: acc.experience + (g.experience || 0),
      }),
      { dedication: 0, experience: 0 }
    );

    if (nationGenerals.length > 0) {
      avgStats.dedication = Math.floor(avgStats.dedication / nationGenerals.length);
      avgStats.experience = Math.floor(avgStats.experience / nationGenerals.length);
    }

    const npcRecruitmentInfo = {
      nationId: iNation.id,
      cityId: iActor.cityId,
      count: createGenCount,
      npcType: 4,
      avgExperience: avgStats.experience,
      avgDedication: avgStats.dedication,
    };

    const broadcastMessage = `<Y>${iActor.name}</>${josaYi} <M>${this.actionName}</>${josaUl} 발동하였습니다.`;

    const nationGeneralLogs: Record<number, string[]> = {};
    for (const gen of nationGenerals) {
      if (gen.id !== actorId) {
        nationGeneralLogs[gen.id] = [broadcastMessage];
      }
    }

    return {
      generals: {
        [actorId]: {
          experience: iActor.experience + expGain,
          dedication: iActor.dedication + expGain,
          lastTurn: {
            action: this.actionName,
          },
        },
      },
      nations: {
        [iNation.id]: {
          strategicCmdLimit: 9,
        },
      },
      env: {
        npcRecruitment: npcRecruitmentInfo,
      },
      logs: {
        general: {
          [actorId]: [`${this.actionName} 발동!`],
          ...nationGeneralLogs,
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} ${this.actionName}${josaUl} 발동`],
        },
      },
    };
  }
}
