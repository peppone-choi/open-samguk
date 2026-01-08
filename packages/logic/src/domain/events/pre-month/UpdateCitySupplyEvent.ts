import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { MapUtil } from "../../MapData.js";
import { JosaUtil } from "@sammo/common";

/**
 * 도시 보급로 갱신 이벤트
 * 레거시: UpdateCitySupply.php
 *
 * 매월 실행되며, 수도로부터의 보급 연결 상태를 계산합니다.
 * - 보급이 끊긴 도시는 모든 수치(인구, 내정 등)가 10% 감소합니다.
 * - 보급이 끊긴 도시의 장수들은 병력 수치가 5% 감소합니다.
 * - 보급이 끊긴 도시의 민심이 30 미만이면 해당 도시는 공백지가 됩니다.
 */
export class PreMonthUpdateCitySupplyEvent implements GameEvent {
  public id = "pre_month_update_city_supply_event";
  public name = "도시 보급 갱신 (월초)";
  public target = EventTarget.PRE_MONTH;
  public priority = 5; // 인구 증가 및 수입 정산보다 먼저 실행

  condition(): boolean {
    return true; // 매달 실행
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

    const nationCities: Record<number, number[]> = {};
    const citySupply: Record<number, number> = {};

    // 초기화: 모든 도시는 보급 끊김으로 시작 (공백지 제외)
    for (const city of Object.values(snapshot.cities)) {
      if (city.nationId === 0) {
        citySupply[city.id] = 1;
      } else {
        citySupply[city.id] = 0;
        if (!nationCities[city.nationId]) {
          nationCities[city.nationId] = [];
        }
        nationCities[city.nationId].push(city.id);
      }
    }

    // 국가별로 수도에서 BFS 시작
    for (const nation of Object.values(snapshot.nations)) {
      if (!nation.capitalCityId) continue;
      const capital = snapshot.cities[nation.capitalCityId];
      if (!capital || capital.nationId !== nation.id) continue;

      const queue: number[] = [nation.capitalCityId];
      citySupply[nation.capitalCityId] = 1;

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const neighbors = MapUtil.getConnections(currentId);

        for (const neighborId of neighbors) {
          const neighbor = snapshot.cities[neighborId];
          if (neighbor && neighbor.nationId === nation.id && citySupply[neighborId] === 0) {
            citySupply[neighborId] = 1;
            queue.push(neighborId);
          }
        }
      }
    }

    // 보급 결과 적용 및 페널티 계산
    for (const city of Object.values(snapshot.cities)) {
      const isSupplied = citySupply[city.id];
      const changedSupply = isSupplied !== city.supply;

      if (isSupplied === 0) {
        // 미보급 페널티 (10% 감소)
        dCities[city.id] = {
          supply: 0,
          pop: Math.floor(city.pop * 0.9),
          trust: Math.floor(city.trust * 0.9),
          agri: Math.floor(city.agri * 0.9),
          comm: Math.floor(city.comm * 0.9),
          secu: Math.floor(city.secu * 0.9),
          def: Math.floor(city.def * 0.9),
          wall: Math.floor(city.wall * 0.9),
        };

        // 해당 도시 장수 페널티 (병력 5% 감소)
        const cityGenerals = Object.values(snapshot.generals).filter(
          (g) => g.cityId === city.id && g.nationId === city.nationId
        );
        for (const g of cityGenerals) {
          dGenerals[g.id] = {
            crew: Math.floor(g.crew * 0.95),
            atmos: Math.floor(g.atmos * 0.95),
            train: Math.floor(g.train * 0.95),
          };
        }

        // 민심 30 미만이면 공백지화
        if (city.trust < 30) {
          dCities[city.id] = {
            ...dCities[city.id],
            nationId: 0,
            term: 0,
            conflict: {},
            front: 0,
          };
          const josaYi = JosaUtil.pick(city.name, "이");
          dLogs.global!.push(
            `【고립】 ${city.name}${josaYi} 보급이 끊겨 민심이 이반되어 미지배 상태가 되었습니다.`
          );
        }
      } else if (changedSupply) {
        // 보급 재개 또는 기존 상태 유지
        dCities[city.id] = { supply: 1 };
      }
    }

    return delta;
  }
}
