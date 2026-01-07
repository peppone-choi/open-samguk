import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 주민 선정 커맨드
 * 레거시: che_주민선정
 */
export class GeneralDevelopTrustCommand extends GeneralCommand {
  readonly actionName = "주민 선정";

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const develCost = (snapshot.env["develcost"] || 20) * 2;

    // 제약 조건 설정
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.NotWanderingNation(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.ReqGeneralRice(develCost),
      ConstraintHelper.ReqCityTrust(this.actionName),
    ];

    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`주민 선정 실패: ${check.reason}`],
          },
        },
      };
    }

    const cityId = iGeneral.cityId;
    const city = snapshot.cities[cityId];
    if (!city) throw new Error(`도시 ${cityId}를 찾을 수 없습니다.`);

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const {
      delta: generalDelta,
      trustGain,
      pick,
    } = general.developTrust(rng, iGeneral.leadership, develCost);

    const newTrust = Math.min(city.trust + trustGain, 100);

    const logs: string[] = [];
    if (pick === "success") {
      logs.push(`주민 선정에 성공하여 민심이 ${trustGain}만큼 크게 상승했습니다.`);
    } else if (pick === "fail") {
      logs.push(`주민 선정에 실패하여 민심이 ${trustGain}만큼 소폭 상승하는 데 그쳤습니다.`);
    } else {
      logs.push(`주민 선정을 통해 민심이 ${trustGain}만큼 상승했습니다.`);
    }

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [cityId]: {
          trust: newTrust,
        },
      },
      logs: {
        general: {
          [actorId]: logs,
        },
      },
    };
  }
}
