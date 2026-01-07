import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 첩보 활동 차단 이벤트
 * 레거시: BlockScoutAction.php
 */
export class BlockScoutActionEvent implements GameEvent {
  public id = "block_scout_action_event";
  public name = "첩보 차단";
  public target = EventTarget.MONTH;
  public priority = 10;

  condition(): boolean {
    return true;
  }

  action(): WorldDelta {
    return {
      env: {
        blockScout: 1,
      },
    };
  }
}
