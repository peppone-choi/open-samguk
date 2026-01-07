import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 전쟁 수입 처리 이벤트 (매월 발생)
 * 레거시: ProcessWarIncome.php
 * 도시 내의 사망자(dead) 수에 비례하여 부가 수입을 얻습니다.
 */
export class ProcessWarIncomeEvent implements GameEvent {
  public id = "process_war_income_event";
  public name = "전쟁 수입 처리";
  public target = EventTarget.MONTH;
  public priority = 130;

  condition(): boolean {
    return true; // 매월 발생
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      nations: {},
    };

    const dNations = delta.nations!;
    const cities = Object.values(snapshot.cities);
    const nations = snapshot.nations;

    for (const city of cities) {
      if (city.nationId === 0 || city.dead <= 0) continue;

      const nation = nations[city.nationId];
      if (!nation) continue;

      // 사망자 10명당 금 1 수입 (레거시 공식: dead / 10)
      const warIncome = Math.floor(city.dead / 10);

      if (warIncome > 0) {
        if (!dNations[city.nationId]) dNations[city.nationId] = {};
        const nDelta = dNations[city.nationId];
        nDelta.gold = (nDelta.gold ?? nation.gold ?? 0) + warIncome;
      }
    }

    return delta;
  }
}
