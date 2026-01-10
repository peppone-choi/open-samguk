import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { City } from "../models/City.js";

/**
 * 농지 개간 커맨드 (레거시: che_농지개간)
 * 현재 머무르고 있는 도시의 농지 수치를 상승시킵니다.
 */
export class GeneralDevelopAgricultureCommand extends GeneralCommand {
  readonly actionName = "농지 개간";

  /**
   * 농지 개간 명령을 실행합니다.
   * 장수의 정치력에 비례하여 농지가 상승합니다.
   * 
   * @param rng 난수 생성기
   * @param snapshot 월드 스냅샷
   * @param actorId 장수 ID
   * @param args 추가 인자 (필요 없음)
   * @returns 상태 변경 델타
   */
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

    const { delta: generalDelta, agriGain } = general.developAgriculture(iGeneral.politics);
    const cityDelta = city.increaseAgri(agriGain);

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [iCity.id]: cityDelta,
      },
      logs: {
        general: {
          [actorId]: [`농지를 개간하여 농지 수치가 ${agriGain} 상승했습니다.`],
        },
      },
    };
  }
}
