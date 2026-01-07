import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 자원 유지비 이벤트
 * 레거시: ProcessSemiAnnual.run() - 유지비 처리 부분
 *
 * 반기(6월, 12월)마다 자원 유지비를 징수합니다.
 * - 장수: 10000 초과 시 3%, 1000 초과 시 1%
 * - 국가: 100000 초과 시 5%, 10000 초과 시 3%, 1000 초과 시 1%
 */
export class ResourceMaintenanceEvent implements GameEvent {
  public id = "resource_maintenance_event";
  public name = "자원 유지비";
  public target = EventTarget.PRE_MONTH;
  public priority = 20; // 인구 증가 이후 실행

  condition(snapshot: WorldSnapshot): boolean {
    // 6월(금), 12월(쌀)에만 실행 (반기)
    const month = snapshot.gameTime.month;
    return month === 6 || month === 12;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      generals: {},
      nations: {},
      logs: {
        global: [],
      },
    };

    const dGenerals = delta.generals as NonNullable<WorldDelta["generals"]>;
    const dNations = delta.nations as NonNullable<WorldDelta["nations"]>;
    const dLogs = delta.logs as Required<NonNullable<WorldDelta["logs"]>>;

    const month = snapshot.gameTime.month;
    const resourceKey = month === 6 ? "gold" : "rice";

    // 장수 유지비 계산
    for (const general of Object.values(snapshot.generals)) {
      const resource = general[resourceKey];
      if (resource > 1000) {
        let newResource: number;
        if (resource > 10000) {
          // 10000 초과: 3% 유지비
          newResource = Math.floor(resource * 0.97);
        } else {
          // 1000 초과: 1% 유지비
          newResource = Math.floor(resource * 0.99);
        }

        dGenerals[general.id] = {
          [resourceKey]: newResource,
        };
      }
    }

    // 국가 유지비 계산
    for (const nation of Object.values(snapshot.nations)) {
      const resource = nation[resourceKey];
      if (resource > 1000) {
        let newResource: number;
        if (resource > 100000) {
          // 100000 초과: 5% 유지비
          newResource = Math.floor(resource * 0.95);
        } else if (resource > 10000) {
          // 10000 초과: 3% 유지비
          newResource = Math.floor(resource * 0.97);
        } else {
          // 1000 초과: 1% 유지비
          newResource = Math.floor(resource * 0.99);
        }

        dNations[nation.id] = {
          [resourceKey]: newResource,
        };
      }
    }

    const resourceName = resourceKey === "gold" ? "금" : "쌀";
    const generalCount = Object.keys(dGenerals).length;
    const nationCount = Object.keys(dNations).length;

    if (generalCount > 0 || nationCount > 0) {
      dLogs.global.push(`${resourceName} 유지비가 징수되었습니다.`);
    }

    return delta;
  }
}
