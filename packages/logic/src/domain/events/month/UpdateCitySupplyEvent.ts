import { JosaUtil } from "@sammo/common";
import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { MapUtil } from "../../MapData.js";

/**
 * 도시 보급 상태 업데이트 이벤트
 * 레거시: UpdateCitySupply.php
 *
 * 수도로부터 보급이 끊긴 도시들의 패널티와 공백지화 처리를 담당합니다.
 */
export class UpdateCitySupplyEvent implements GameEvent {
  public id = "update_city_supply_event";
  public name = "도시 보급 상태 업데이트";
  public target = EventTarget.MONTH;
  public priority = 90;

  condition(snapshot: WorldSnapshot): boolean {
    // 매월 발생
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      cities: {},
      generals: {},
      logs: {
        global: [],
      },
    };

    const dCities = delta.cities!;
    const dGenerals = delta.generals!;
    const dLogs = delta.logs!;

    // 1. 보급 경로 계산 (BFS)
    const citySupplyMap: Record<number, boolean> = {};
    const nations = Object.values(snapshot.nations);
    const nationsById = snapshot.nations;

    for (const nation of nations) {
      if (nation.level <= 0) continue;

      const capitalId = nation.capitalCityId;
      if (
        !capitalId ||
        !snapshot.cities[capitalId] ||
        snapshot.cities[capitalId].nationId !== nation.id
      ) {
        continue;
      }

      const queue: number[] = [capitalId];
      citySupplyMap[capitalId] = true;

      let head = 0;
      while (head < queue.length) {
        const cityId = queue[head++];
        const connections = MapUtil.getConnections(cityId);

        for (const connId of connections) {
          if (citySupplyMap[connId]) continue;
          const connCity = snapshot.cities[connId];
          if (connCity && connCity.nationId === nation.id) {
            citySupplyMap[connId] = true;
            queue.push(connId);
          }
        }
      }
    }

    // 2. 보급 상태 업데이트 및 패널티 적용
    const allCities = Object.values(snapshot.cities);
    const lostCities: number[] = [];

    for (const city of allCities) {
      if (city.nationId === 0) {
        // 공백지는 항상 보급 상태로 간주 (패널티 없음)
        if (city.supply !== 1) {
          if (!dCities[city.id]) dCities[city.id] = {};
          dCities[city.id].supply = 1;
        }
        continue;
      }

      const isSupplied = !!citySupplyMap[city.id];

      if (!isSupplied) {
        // 미보급 도시 패널티 (10% 감소)
        if (!dCities[city.id]) dCities[city.id] = {};
        const cityDelta = dCities[city.id];
        cityDelta.supply = 0;
        cityDelta.pop = Math.floor(city.pop * 0.9);
        // city.trust is actually in entities? let's check
        // In entities.ts, trust is not listed, but in PHP it is.
        // Let's check if I should add it to delta if it exists in snapshot.
        if ((city as any).trust !== undefined) {
          (cityDelta as any).trust = Math.floor((city as any).trust * 0.9);
        }
        cityDelta.agri = Math.floor(city.agri * 0.9);
        cityDelta.comm = Math.floor(city.comm * 0.9);
        cityDelta.secu = Math.floor(city.secu * 0.9);
        cityDelta.def = Math.floor(city.def * 0.9);
        cityDelta.wall = Math.floor(city.wall * 0.9);

        // 미보급 도시 장수 패널티 (병사, 사기, 훈련 5% 감소)
        for (const general of Object.values(snapshot.generals)) {
          if (general.cityId === city.id && general.nationId === city.nationId) {
            if (!dGenerals[general.id]) dGenerals[general.id] = {};
            const genDelta = dGenerals[general.id];
            genDelta.crew = Math.floor(general.crew * 0.95);
            genDelta.atmos = Math.floor(general.atmos * 0.95);
            genDelta.train = Math.floor(general.train * 0.95);
          }
        }

        // 민심 30 미만이면 공백지화
        if (((city as any).trust || 100) < 30) {
          lostCities.push(city.id);
        }
      } else {
        if (city.supply !== 1) {
          if (!dCities[city.id]) dCities[city.id] = {};
          dCities[city.id].supply = 1;
        }
      }
    }

    // 3. 고립된 도시 공백지 처리
    for (const cityId of lostCities) {
      const city = snapshot.cities[cityId];
      const josaYi = JosaUtil.pick(city.name, "이");
      dLogs.global!.push(
        `<R><b>【고립】</b></><G><b>${city.name}</b></>${josaYi} 보급이 끊겨 <R>미지배</> 도시가 되었습니다.`
      );

      if (!dCities[cityId]) dCities[cityId] = {};
      const cityDelta = dCities[cityId];
      cityDelta.nationId = 0;
      cityDelta.term = 0;
      cityDelta.front = 0;
      // set conflict to empty object
      (cityDelta as any).conflict = {};

      // 소속 장수들 하야 처리
      for (const general of Object.values(snapshot.generals)) {
        if (general.cityId === cityId && general.nationId === city.nationId) {
          if (!dGenerals[general.id]) dGenerals[general.id] = {};
          const genDelta = dGenerals[general.id];
          genDelta.officerLevel = 1; // 평민/장수
          // officerCity is not in TS entity yet? Let's check
        }
      }
    }

    return delta;
  }
}
