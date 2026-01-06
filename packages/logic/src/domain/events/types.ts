import { WorldSnapshot, WorldDelta } from "../entities.js";
import { DeltaUtil } from "../../utils/DeltaUtil.js";

/**
 * 이벤트 실행 시점 (Legacy: EventTarget)
 */
export enum EventTarget {
  PRE_MONTH = "PRE_MONTH",
  MONTH = "MONTH",
  OCCUPY_CITY = "OCCUPY_CITY",
  DESTROY_NATION = "DESTROY_NATION",
  UNITED = "UNITED",
}

/**
 * 이벤트 핸들러 인터페이스
 * 레거시의 StaticEvent와 DynamicEvent를 통합적으로 처리
 */
export interface GameEvent {
  id: string;
  name: string;
  target: EventTarget;
  priority: number; // 낮을수록 먼저 실행 (Legacy: PRIORITY_MIN = 0)

  /**
   * 이벤트 실행 조건 검사
   */
  condition(snapshot: WorldSnapshot, context?: any): boolean;

  /**
   * 이벤트 실행 및 결과 델타 반환
   */
  action(snapshot: WorldSnapshot, context?: any): WorldDelta;
}

/**
 * 이벤트 레지스트리
 */
export class EventRegistry {
  private events: Map<EventTarget, GameEvent[]> = new Map();

  constructor() {
    // Initialize map for all targets
    for (const target of Object.values(EventTarget)) {
      this.events.set(target, []);
    }
  }

  public register(event: GameEvent) {
    const targetList = this.events.get(event.target);
    if (targetList) {
      targetList.push(event);
      // Priority 오름차순 정렬 (0 -> 100)
      targetList.sort((a, b) => a.priority - b.priority);
    }
  }

  public getEvents(target: EventTarget): GameEvent[] {
    return this.events.get(target) || [];
  }

  /**
   * 특정 타겟의 모든 이벤트를 실행하고 결과를 합침
   * @param target 실행할 이벤트 타겟
   * @param snapshot 현재 월드 상태
   * @param context 추가 컨텍스트 (예: 점령된 도시 ID 등)
   */
  public runEvents(
    target: EventTarget,
    snapshot: WorldSnapshot,
    context?: any,
  ): WorldDelta {
    const events = this.getEvents(target);
    const combinedDelta: WorldDelta = {};

    // 임시 스냅샷은 만들지 않고, 델타만 누적함.
    // (레거시에서도 순차 실행이지만, 각 이벤트가 즉시 반영된 상태를 보는지 여부는 체크 필요.
    //  일단은 독립적인 실행으로 가정하고 Delta Merge)

    // Note: 결정론적 실행을 위해 순서가 보장된 상태에서 실행됨
    for (const event of events) {
      if (event.condition(snapshot, context)) {
        const delta = event.action(snapshot, context);
        DeltaUtil.merge(combinedDelta, delta);
      }
    }

    return combinedDelta;
  }
}
