import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { Nation } from "../models/Nation.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 기술 연구 커맨드
 * 레거시: che_기술연구
 */
export class GeneralResearchTechCommand extends GeneralCommand {
  readonly actionName = "기술 연구";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    // 비용 및 보급 체크는 run에서 동적으로 하거나 fullCondition에 포함
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.SuppliedCity(),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iCity = snapshot.cities[iGeneral.cityId];
    if (!iCity) throw new Error(`도시 ${iGeneral.cityId}를 찾을 수 없습니다.`);

    const iNation = snapshot.nations[iGeneral.nationId];
    if (!iNation)
      throw new Error(`국가 ${iGeneral.nationId}를 찾을 수 없습니다.`);

    // 비용 계산 (develcost 환경 변수 사용, 없으면 기본값 100)
    const develCost = snapshot.env.develcost ?? 100;
    const reqGold = develCost;

    // 제약 조건 검사 (비용 체크 포함)
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: { [actorId]: [`기술 연구 실패: ${check.reason}`] },
        },
      };
    }

    if (iGeneral.gold < reqGold) {
      return {
        logs: {
          general: {
            [actorId]: [
              `기술 연구 실패: 자금이 부족합니다. (필요: ${reqGold})`,
            ],
          },
        },
      };
    }

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const nation = new Nation(iNation);

    // 기술 연구 로직 수행
    const {
      delta: generalDelta,
      techGain,
      pick,
    } = general.researchTech(
      rng,
      iGeneral.intel,
      iCity.trust,
      iGeneral.meta.explevel ?? 0,
    );

    // 기술 한계 체크
    const relYear = (snapshot.env.year ?? 0) - (snapshot.env.startyear ?? 0);
    const relMaxTechLevel = Math.min(
      Math.floor(relYear / GameConst.techLevelIncYear) +
        GameConst.initialAllowedTechLevel,
      GameConst.maxTechLevel,
    );

    // 현재 국가 기술 레벨 계산 (임시: tech / 1000)
    const currentTechLevel = Math.floor(iNation.tech / 1000);

    let finalTechGain = techGain;
    if (currentTechLevel >= relMaxTechLevel) {
      finalTechGain = Math.max(Math.floor(techGain / 4), 1);
    }

    // 국가 내 장수 수 보정 (장수 수로 나눔)
    // snapshot에서 해당 국가 장수 수를 계산
    const gennum =
      Object.values(snapshot.generals).filter(
        (g) => g.nationId === iGeneral.nationId,
      ).length || 1;
    const nationTechGain = finalTechGain / gennum;

    const nationDelta = nation.increaseTech(nationTechGain);
    generalDelta.gold = iGeneral.gold - reqGold;

    let logMsg = `기술을 연구하여 국가 기술력이 ${nationTechGain.toFixed(2)} 상승했습니다.`;
    if (pick === "success") {
      logMsg = `기술 연구에 성공하여 국가 기술력이 ${nationTechGain.toFixed(2)} 상승했습니다.`;
    } else if (pick === "fail") {
      logMsg = `기술 연구에 실패하여 국가 기술력이 ${nationTechGain.toFixed(2)} 상승했습니다.`;
    }

    return {
      generals: {
        [actorId]: generalDelta,
      },
      nations: {
        [iNation.id]: nationDelta,
      },
      logs: {
        general: {
          [actorId]: [logMsg],
        },
      },
    };
  }
}
