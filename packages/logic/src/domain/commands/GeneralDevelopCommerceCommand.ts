import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { City } from "../models/City.js";

/**
 * 상업 투자 커맨드
 * 레거시: che_상업투자
 */
export class GeneralDevelopCommerceCommand extends GeneralCommand {
  readonly actionName = "상업 투자";

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iCity = snapshot.cities[iGeneral.cityId];
    if (!iCity) throw new Error(`도시 ${iGeneral.cityId}를 찾을 수 없습니다.`);

    // DDD: 도메인 모델로 래핑하여 비즈니스 로직 수행
    const general = new General(iGeneral);
    const city = new City(iCity);

    const { delta: generalDelta, commGain } = general.developCommerce(iGeneral.intel);
    const cityDelta = city.increaseComm(commGain);

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [iCity.id]: cityDelta,
      },
      logs: {
        general: {
          [actorId]: [`상업에 투자하여 상업 수치가 ${commGain} 상승했습니다.`],
        },
      },
    };
  }
}
