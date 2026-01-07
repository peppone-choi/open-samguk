import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { City } from "../models/City.js";

/**
 * 성벽 보수 커맨드
 * 레거시: che_성벽보수
 */
export class GeneralRepairWallCommand extends GeneralCommand {
  readonly actionName = "성벽 보수";

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

    const { delta: generalDelta, wallGain } = general.repairWall(iGeneral.strength);
    const cityDelta = city.increaseWall(wallGain);

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [iCity.id]: cityDelta,
      },
      logs: {
        general: {
          [actorId]: [`성벽을 보수하여 성벽 수치가 ${wallGain} 상승했습니다.`],
        },
      },
    };
  }
}
