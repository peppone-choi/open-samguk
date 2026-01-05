import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { MapUtil } from "../MapData.js";

/**
 * 접경귀환 커맨드 - 적진에서 가장 가까운 아국 도시로 즉시 귀환
 * 레거시: che_접경귀환
 *
 * 조건: 비점령지(적진 또는 공백지)에서만 사용 가능
 * 효과: 3칸 이내의 보급 연결된 아국 도시 중 가장 가까운 곳으로 이동
 */
export class GeneralBorderReturnCommand extends GeneralCommand {
  readonly actionName = "접경귀환";

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.NotWanderingNation(),
      ConstraintHelper.NotOccupiedCity(), // 아국 도시가 아닌 곳에서만 사용 가능
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, unknown>,
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`접경귀환 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const currentCityId = iGeneral.cityId;
    const nationId = iGeneral.nationId;

    // 3칸 이내 도시 목록 가져오기 (거리별 배열)
    const distanceList = MapUtil.searchDistance(currentCityId, 3);

    // 거리 순서대로 보급 연결된 아국 도시 찾기
    let nearestCityList: number[] = [];
    for (const citiesAtDistance of distanceList) {
      for (const cityId of citiesAtDistance) {
        const city = snapshot.cities[cityId];
        if (city && city.nationId === nationId && city.supply === 1) {
          nearestCityList.push(cityId);
        }
      }
      // 해당 거리에서 아국 도시를 찾았으면 중단
      if (nearestCityList.length > 0) {
        break;
      }
    }

    if (nearestCityList.length === 0) {
      return {
        logs: {
          general: {
            [actorId]: ["3칸 이내에 아국 도시가 없습니다."],
          },
        },
      };
    }

    // 여러 후보가 있으면 랜덤 선택
    const destCityId = rng.choice(nearestCityList);
    const destCity = snapshot.cities[destCityId];
    const destCityName = destCity?.name ?? "알 수 없는 도시";

    const josaRo = JosaUtil.pick(destCityName, "로");

    return {
      generals: {
        [actorId]: {
          cityId: destCityId,
        },
      },
      logs: {
        general: {
          [actorId]: [`${destCityName}${josaRo} 접경귀환했습니다.`],
        },
      },
    };
  }
}
