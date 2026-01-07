import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 특정 이벤트를 삭제하는 이벤트
 * 레거시: DeleteEvent.php
 */
export class DeleteEventEvent implements GameEvent {
  public id = "delete_event_event";
  public name = "이벤트 삭제";
  public target = EventTarget.MONTH;
  public priority = 0;

  constructor(public targetEventId: string) {}

  condition(): boolean {
    return true;
  }

  action(): WorldDelta {
    return {
      deleteEvents: [this.targetEventId],
    };
  }
}
