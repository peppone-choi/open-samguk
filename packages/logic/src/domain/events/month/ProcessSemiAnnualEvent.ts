import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { GameConst } from "../../GameConst.js";

/**
 * 반기별(1월, 7월) 처리 이벤트
 * 레거시: ProcessSemiAnnual.php
 *
 * 인구 증가, 치안/시설물 유지비, 자원 유지비 등을 처리합니다.
 */
export class ProcessSemiAnnualEvent implements GameEvent {
  public id = "process_semi_annual_event";
  public name = "반기별 정산 처리";
  public target = EventTarget.MONTH;
  public priority = 110;

  condition(snapshot: WorldSnapshot): boolean {
    const { month } = snapshot.gameTime;
    // 1월과 7월에 발생 (반기 정산)
    return month === 1 || month === 7;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      cities: {},
      nations: {},
      generals: {},
    };

    const dCities = delta.cities!;
    const dNations = delta.nations!;
    const dGenerals = delta.generals!;

    const nations = Object.values(snapshot.nations);
    const cities = Object.values(snapshot.cities);
    const generals = Object.values(snapshot.generals);

    // 1. 공백지 내정 수치 자연 감소
    for (const city of cities) {
      if (city.nationId === 0) {
        if (!dCities[city.id]) dCities[city.id] = {};
        const cityDelta = dCities[city.id];
        // 민심은 50으로 수렴, 나머지는 1%씩 감소
        (cityDelta as any).trust = 50;
        cityDelta.agri = Math.floor(city.agri * 0.99);
        cityDelta.comm = Math.floor(city.comm * 0.99);
        cityDelta.secu = Math.floor(city.secu * 0.99);
        cityDelta.def = Math.floor(city.def * 0.99);
        cityDelta.wall = Math.floor(city.wall * 0.99);
      }
    }

    // 2. 국가별 인구 증가 및 도시 내정 수치 갱신
    for (const nation of nations) {
      if (nation.id === 0) continue;

      const taxRate = nation.meta.rate || 10;
      // 인구 증가율 계산 (세율 20% 기준 5%, 5% 기준 12.5%, 50% 기준 -10%)
      const popRatio = (30 - taxRate) / 200;
      // 내정 수치 변화율 (세율 20% 기준 0%, 0% 기준 10%)
      const genericRatio = (20 - taxRate) / 200;
      // 민심 변화
      const trustDiff = 20 - taxRate;

      const nationCities = cities.filter((c) => c.nationId === nation.id && c.supply === 1);

      for (const city of nationCities) {
        if (!dCities[city.id]) dCities[city.id] = {};
        const cityDelta = dCities[city.id];

        // 인구 증가 (기본 증가량 + 비율 증가)
        const basePopInc = 500; // GameConst.$basePopIncreaseAmount
        let newPop: number;
        if (popRatio >= 0) {
          newPop =
            city.pop +
            basePopInc +
            Math.floor(city.pop * popRatio * (1 + city.secu / city.secuMax / 10));
        } else {
          newPop =
            city.pop +
            basePopInc +
            Math.floor(city.pop * popRatio * (1 - city.secu / city.secuMax / 10));
        }
        cityDelta.pop = Math.min(city.popMax, Math.max(0, newPop));

        // 내정 수치 (농업, 상업, 치안, 수비, 성벽)
        cityDelta.agri = Math.min(city.agriMax, Math.floor(city.agri * (1 + genericRatio)));
        cityDelta.comm = Math.min(city.commMax, Math.floor(city.comm * (1 + genericRatio)));
        cityDelta.secu = Math.min(city.secuMax, Math.floor(city.secu * (1 + genericRatio)));
        cityDelta.def = Math.min(city.defMax, Math.floor(city.def * (1 + genericRatio)));
        cityDelta.wall = Math.min(city.wallMax, Math.floor(city.wall * (1 + genericRatio)));

        // 민심
        if ((city as any).trust !== undefined) {
          (cityDelta as any).trust = Math.min(100, Math.max(0, (city as any).trust + trustDiff));
        }
      }
    }

    // 3. 자원 유지비 (금/쌀) - 1월은 금, 7월은 쌀
    const resourceType = snapshot.gameTime.month === 1 ? "gold" : "rice";

    // 장수 유지비
    for (const general of generals) {
      const amount = (general as any)[resourceType] || 0;
      if (amount > 1000) {
        if (!dGenerals[general.id]) dGenerals[general.id] = {};
        const genDelta = dGenerals[general.id];
        const multi = amount > 10000 ? 0.97 : 0.99;
        (genDelta as any)[resourceType] = Math.floor(amount * multi);
      }
    }

    // 국가 유지비
    for (const nation of nations) {
      const amount = (nation as any)[resourceType] || 0;
      if (amount > 1000) {
        if (!dNations[nation.id]) dNations[nation.id] = {};
        const nationDelta = dNations[nation.id];
        let multi = 0.99;
        if (amount > 100000) multi = 0.95;
        else if (amount > 10000) multi = 0.97;
        (nationDelta as any)[resourceType] = Math.floor(amount * multi);
      }
    }

    return delta;
  }
}
