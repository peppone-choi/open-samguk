import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 강행 커맨드
 * 레거시: che_강행
 */
export class GeneralForcedMarchCommand extends GeneralCommand {
  readonly actionName = "강행";

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const destCityId = args.destCityId;
    const destCity = snapshot.cities[destCityId];
    if (!destCity) throw new Error(`도시 ${destCityId}를 찾을 수 없습니다.`);

    const develcost = snapshot.env.develcost ?? 100;
    const reqGold = develcost * 5;

    this.fullConditionConstraints = [
      ConstraintHelper.NotSameDestCity(),
      ConstraintHelper.NearCity(3),
      ConstraintHelper.ReqGeneralGold(reqGold),
    ];

    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`강행 실패: ${check.reason}`],
          },
        },
      };
    }

    const general = new General(iGeneral);

    // 강행 효과: 도시 이동, 훈련/사기 감소, 경험치/통솔경험 증가
    const expGain = 100;
    const trainLoss = 5;
    const atmosLoss = 5;

    const generalDelta = {
      cityId: destCityId,
      gold: iGeneral.gold - reqGold,
      train: Math.max(iGeneral.train - trainLoss, 20),
      atmos: Math.max(iGeneral.atmos - atmosLoss, 20),
      experience: iGeneral.experience + expGain,
      leadershipExp: iGeneral.leadershipExp + 1,
    };

    const delta: WorldDelta = {
      generals: {
        [actorId]: generalDelta,
      },
      logs: {
        general: {
          [actorId]: [`${destCity.name}(으)로 강행했습니다.`],
        },
      },
    };

    // 방랑군 군주인 경우 소속 장수들도 함께 이동
    const nation = snapshot.nations[iGeneral.nationId];
    if (iGeneral.officerLevel === 12 && nation && nation.level === 0) {
      for (const [id, g] of Object.entries(snapshot.generals)) {
        const gid = Number(id);
        if (gid !== actorId && g.nationId === iGeneral.nationId) {
          if (!delta.generals) delta.generals = {};
          delta.generals[gid] = {
            ...delta.generals[gid],
            cityId: destCityId,
          };
          if (!delta.logs) delta.logs = {};
          if (!delta.logs.general) delta.logs.general = {};
          delta.logs.general[gid] = [`방랑군 세력이 ${destCity.name}(으)로 강행했습니다.`];
        }
      }
    }

    return delta;
  }
}
