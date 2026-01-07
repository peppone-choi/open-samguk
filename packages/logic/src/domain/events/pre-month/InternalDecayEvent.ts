import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 내정 자연 감소 이벤트
 * 레거시: ProcessSemiAnnual.run() - 내정 1% 감소 부분
 *
 * 반기(6월, 12월)마다 모든 도시의 내정 수치가 1% 자연 감소합니다.
 * 부상병(dead)은 0으로 초기화됩니다.
 */
export class InternalDecayEvent implements GameEvent {
  public id = "internal_decay_event";
  public name = "내정 자연 감소";
  public target = EventTarget.PRE_MONTH;
  public priority = 5; // 인구 증가보다 먼저 실행

  condition(snapshot: WorldSnapshot): boolean {
    // 6월, 12월에만 실행 (반기)
    const month = snapshot.gameTime.month;
    return month === 6 || month === 12;
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

    // 모든 도시의 내정 1% 감소
    for (const city of Object.values(snapshot.cities)) {
      dCities[city.id] = {
        agri: Math.floor(city.agri * 0.99),
        comm: Math.floor(city.comm * 0.99),
        secu: Math.floor(city.secu * 0.99),
        def: Math.floor(city.def * 0.99),
        wall: Math.floor(city.wall * 0.99),
      };
    }

    if (Object.keys(dCities).length > 0) {
      dLogs.global.push("내정 수치가 자연 감소했습니다.");
    }

    return delta;
  }
}
