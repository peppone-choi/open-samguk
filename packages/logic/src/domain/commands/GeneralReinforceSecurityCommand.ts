import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { City } from "../models/City.js";

/**
 * 치안 강화 커맨드
 * 레거시: che_치안강화
 */
export class GeneralReinforceSecurityCommand extends GeneralCommand {
  readonly actionName = "치안 강화";

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

    const { delta: generalDelta, secuGain } = general.reinforceSecurity(iGeneral.strength);
    const cityDelta = city.increaseSecu(secuGain);

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [iCity.id]: cityDelta,
      },
      logs: {
        general: {
          [actorId]: [`치안을 강화하여 치안 수치가 ${secuGain} 상승했습니다.`],
        },
      },
    };
  }
}
