import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta, City } from "../../entities.js";
import { LiteHashDRBG, RandUtil } from "@sammo/common";

/**
 * 호황 이벤트 타입
 */
interface HarvestType {
  stateCode: number;
  title: string;
  message: string;
}

/**
 * 수확/호황 이벤트
 * 레거시: RaiseDisaster (호황 부분)
 *
 * 4월, 7월에 호황이 발생할 수 있습니다.
 * - 치안이 높을수록 호황 발생 확률이 높아집니다.
 * - 호황 시: 도시의 내정/인구/민심이 증가합니다.
 */
export class HarvestEvent implements GameEvent {
  public id = "harvest_event";
  public name = "호황";
  public target = EventTarget.MONTH;
  public priority = 51; // 재해 이벤트 이후 실행

  // 계절별 호황 타입
  private static readonly HARVEST_TYPES: Record<number, HarvestType[]> = {
    4: [{ stateCode: 2, title: "호황", message: "호황으로 도시가 번창하고 있습니다." }],
    7: [{ stateCode: 1, title: "풍작", message: "풍작으로 도시가 번창하고 있습니다." }],
  };

  // 호황 발생 확률 (레거시: boomingRate)
  private static readonly BOOMING_RATE: Record<number, number> = {
    1: 0,
    4: 0.25,
    7: 0.25,
    10: 0,
  };

  condition(snapshot: WorldSnapshot): boolean {
    const startYear = snapshot.env["startyear"] || 184;
    const { year, month } = snapshot.gameTime;

    // 시작 후 3년 이후부터 적용
    if (year < startYear + 3) {
      return false;
    }

    // 4월, 7월에만 실행 (호황 가능한 달)
    return month === 4 || month === 7;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      cities: {},
      logs: {
        global: [],
      },
    };

    const dCities = delta.cities as NonNullable<WorldDelta["cities"]>;
    const dLogs = delta.logs as Required<NonNullable<WorldDelta["logs"]>>;

    const { year, month } = snapshot.gameTime;
    const hiddenSeed = snapshot.env["hiddenSeed"] || "default-seed";

    // 결정론적 RNG 생성 (재해와 다른 시드 사용)
    const seed = `${hiddenSeed}:harvest:${year}:${month}`;
    const rng = new RandUtil(new LiteHashDRBG(seed));

    // 호황 발생 여부 결정
    const boomingRate = HarvestEvent.BOOMING_RATE[month] || 0;
    if (!rng.nextBool(boomingRate)) {
      return delta;
    }

    // 호황 대상 도시 선정
    const targetCities: City[] = [];

    for (const city of Object.values(snapshot.cities)) {
      const secuRatio = city.secuMax > 0 ? city.secu / city.secuMax : 0;

      // 호황 발생 확률: 2% + (치안 비율 * 5%) = 2~7%
      const raiseProb = 0.02 + secuRatio * 0.05;

      if (rng.nextBool(raiseProb)) {
        targetCities.push(city);
      }
    }

    if (targetCities.length === 0) {
      return delta;
    }

    // 호황 타입 선택
    const harvestTypes = HarvestEvent.HARVEST_TYPES[month];
    if (!harvestTypes || harvestTypes.length === 0) {
      return delta;
    }

    const harvest = rng.choice(harvestTypes);
    const cityNames = targetCities.map((c) => c.name).join(", ");

    dLogs.global.push(`【${harvest.title}】${cityNames}에 ${harvest.message}`);

    // 호황 효과 적용
    for (const city of targetCities) {
      const secuRatio = city.secuMax > 0 ? city.secu / city.secuMax : 0;

      // 증가율 계산: 치안이 높을수록 효과가 좋음 (101~105%)
      const affectRatio = 1.01 + Math.min(secuRatio / 0.8, 1) * 0.04;

      dCities[city.id] = {
        state: harvest.stateCode,
        pop: Math.min(Math.floor(city.pop * affectRatio), city.popMax),
        trust: Math.min(Math.floor(city.trust * affectRatio), 100),
        agri: Math.min(Math.floor(city.agri * affectRatio), city.agriMax),
        comm: Math.min(Math.floor(city.comm * affectRatio), city.commMax),
        secu: Math.min(Math.floor(city.secu * affectRatio), city.secuMax),
        def: Math.min(Math.floor(city.def * affectRatio), city.defMax),
        wall: Math.min(Math.floor(city.wall * affectRatio), city.wallMax),
      };
    }

    return delta;
  }
}
