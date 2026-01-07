import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 전역 배반 수치 증가 이벤트
 * 레거시: AddGlobalBetray.php
 *
 * 특정 조건에서 모든 장수의 배반(betray) 수치를 증가시킵니다.
 */
export class AddGlobalBetrayEvent implements GameEvent {
  public id = "add_global_betray_event";
  public name = "전역 배반 증가";
  public target = EventTarget.MONTH;
  public priority = 100;

  constructor(
    private cnt: number = 1,
    private ifMax: number = 0
  ) {}

  condition(): boolean {
    // 보통 이 이벤트는 시나리오나 특정 트리거에 의해 동적으로 등록되어 사용되거나,
    // 특정 조건에서만 실행되도록 설정됩니다.
    // 여기서는 기본적으로 비활성화하고, 필요한 경우 상속하거나 context를 통해 조절하도록 합니다.
    return false;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const generalUpdates: Record<number, any> = {};

    for (const general of Object.values(snapshot.generals)) {
      if ((general.betray || 0) <= this.ifMax) {
        generalUpdates[general.id] = {
          betray: (general.betray || 0) + this.cnt,
        };
      }
    }

    return {
      generals: generalUpdates,
    };
  }
}
