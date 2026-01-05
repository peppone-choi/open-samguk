import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { City } from "../models/City.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 수비 강화 커맨드
 * 레거시: che_수비강화
 */
export class GeneralStrengthenDefenseCommand extends GeneralCommand {
  readonly actionName = "수비 강화";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NotWanderingNation(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.RemainCityCapacity("def", this.actionName),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    // 비용 계산 (develcost 활용)
    const develCost = snapshot.env["develcost"] || 20;
    const reqGold = Math.round(develCost);

    // fullConditionConstraints에 비용 체크 추가
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`수비 강화 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    if (iGeneral.gold < reqGold) {
      return {
        logs: {
          general: {
            [actorId]: [
              `수비 강화 실패: 자금이 부족합니다. (필요: ${reqGold})`,
            ],
          },
        },
      };
    }

    const iCity = snapshot.cities[iGeneral.cityId];
    if (!iCity) throw new Error(`도시 ${iGeneral.cityId}를 찾을 수 없습니다.`);

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const city = new City(iCity);

    const { delta: generalDelta, defGain } = general.strengthenDefense(
      iGeneral.strength,
    );
    const cityDelta = city.increaseDef(defGain);

    // 금 소모 반영
    generalDelta.gold = iGeneral.gold - reqGold;

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [iCity.id]: cityDelta,
      },
      logs: {
        general: {
          [actorId]: [
            `수비를 강화하여 도시 수비 수치가 ${defGain} 상승했습니다. (소모 금: ${reqGold})`,
          ],
        },
      },
    };
  }
}
