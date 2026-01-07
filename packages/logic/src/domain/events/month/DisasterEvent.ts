import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta, City } from "../../entities.js";
import { LiteHashDRBG, RandUtil } from "@sammo/common";

/**
 * 재난 이벤트 타입
 */
interface DisasterType {
  stateCode: number;
  message: string;
}

/**
 * 재해 이벤트
 * 레거시: RaiseDisaster
 *
 * 1월, 4월, 7월, 10월에 재해가 발생할 수 있습니다.
 * - 치안이 낮을수록 재해 발생 확률이 높아집니다.
 * - 재해 시: 도시의 내정/인구/민심이 감소합니다.
 * - 장수 부상 가능성도 있습니다.
 */
export class DisasterEvent implements GameEvent {
  public id = "disaster_event";
  public name = "재해";
  public target = EventTarget.MONTH;
  public priority = 50;

  // 계절별 재해 타입
  private static readonly DISASTER_TYPES: Record<number, DisasterType[]> = {
    1: [
      { stateCode: 4, message: "역병이 발생하여 도시가 황폐해지고 있습니다." },
      { stateCode: 5, message: "지진으로 피해가 속출하고 있습니다." },
      { stateCode: 3, message: "추위가 풀리지 않아 얼어죽는 백성들이 늘어나고 있습니다." },
      { stateCode: 9, message: "황건적이 출현해 도시를 습격하고 있습니다." },
    ],
    4: [
      { stateCode: 7, message: "홍수로 인해 피해가 급증하고 있습니다." },
      { stateCode: 5, message: "지진으로 피해가 속출하고 있습니다." },
      { stateCode: 6, message: "태풍으로 인해 피해가 속출하고 있습니다." },
    ],
    7: [
      { stateCode: 8, message: "메뚜기 떼가 발생하여 도시가 황폐해지고 있습니다." },
      { stateCode: 5, message: "지진으로 피해가 속출하고 있습니다." },
      { stateCode: 8, message: "흉년이 들어 굶어죽는 백성들이 늘어나고 있습니다." },
    ],
    10: [
      { stateCode: 3, message: "혹한으로 도시가 황폐해지고 있습니다." },
      { stateCode: 5, message: "지진으로 피해가 속출하고 있습니다." },
      { stateCode: 3, message: "눈이 많이 쌓여 도시가 황폐해지고 있습니다." },
      { stateCode: 9, message: "황건적이 출현해 도시를 습격하고 있습니다." },
    ],
  };

  condition(snapshot: WorldSnapshot): boolean {
    const startYear = snapshot.env["startyear"] || 184;
    const { year, month } = snapshot.gameTime;

    // 시작 후 3년 이후부터 적용
    if (year < startYear + 3) {
      return false;
    }

    // 1월, 4월, 7월, 10월에만 실행
    return month === 1 || month === 4 || month === 7 || month === 10;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      cities: {},
      generals: {},
      logs: {
        general: {},
        global: [],
      },
    };

    const dCities = delta.cities as NonNullable<WorldDelta["cities"]>;
    const dGenerals = delta.generals as NonNullable<WorldDelta["generals"]>;
    const dLogs = delta.logs as Required<NonNullable<WorldDelta["logs"]>>;

    const { year, month } = snapshot.gameTime;
    const hiddenSeed = snapshot.env["hiddenSeed"] || "default-seed";

    // 결정론적 RNG 생성
    const seed = `${hiddenSeed}:disaster:${year}:${month}`;
    const rng = new RandUtil(new LiteHashDRBG(seed));

    // 재해 상태 초기화 (state <= 10인 도시들)
    for (const city of Object.values(snapshot.cities)) {
      if (city.state <= 10) {
        dCities[city.id] = { state: 0 };
      }
    }

    // 재해 대상 도시 선정
    const targetCities: City[] = [];

    for (const city of Object.values(snapshot.cities)) {
      const secuRatio = city.secuMax > 0 ? city.secu / city.secuMax : 0;

      // 재해 발생 확률: 6% - (치안 비율 * 5%) = 1~6%
      const raiseProb = 0.06 - secuRatio * 0.05;

      if (rng.nextBool(raiseProb)) {
        targetCities.push(city);
      }
    }

    if (targetCities.length === 0) {
      return delta;
    }

    // 재해 타입 선택
    const disasterTypes = DisasterEvent.DISASTER_TYPES[month];
    if (!disasterTypes || disasterTypes.length === 0) {
      return delta;
    }

    const disaster = rng.choice(disasterTypes);
    const cityNames = targetCities.map((c) => c.name).join(", ");

    dLogs.global.push(`【재난】${cityNames}에 ${disaster.message}`);

    // 재해 피해 적용
    for (const city of targetCities) {
      const secuRatio = city.secuMax > 0 ? city.secu / city.secuMax : 0;

      // 피해율 계산: 치안이 높을수록 피해가 줄어듦 (80~95%)
      const affectRatio = 0.8 + Math.min(secuRatio / 0.8, 1) * 0.15;

      const existingDelta = dCities[city.id] || {};
      dCities[city.id] = {
        ...existingDelta,
        state: disaster.stateCode,
        pop: Math.floor(city.pop * affectRatio),
        trust: Math.floor(city.trust * affectRatio),
        agri: Math.floor(city.agri * affectRatio),
        comm: Math.floor(city.comm * affectRatio),
        secu: Math.floor(city.secu * affectRatio),
        def: Math.floor(city.def * affectRatio),
        wall: Math.floor(city.wall * affectRatio),
      };

      // 해당 도시의 장수들 부상 처리
      const cityGenerals = Object.values(snapshot.generals).filter((g) => g.cityId === city.id);

      for (const general of cityGenerals) {
        // 부상 확률: 10%
        if (rng.nextBool(0.1)) {
          const injury = rng.nextRangeInt(10, 30);
          const newInjury = Math.min(100, general.injury + injury);

          dGenerals[general.id] = {
            injury: newInjury,
          };

          if (!dLogs.general[general.id]) {
            dLogs.general[general.id] = [];
          }
          dLogs.general[general.id].push(`재난으로 부상을 입었습니다. (부상도 +${injury})`);
        }
      }
    }

    return delta;
  }
}
