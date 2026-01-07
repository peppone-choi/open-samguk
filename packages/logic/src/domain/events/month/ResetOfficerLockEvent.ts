import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 장수 커맨드 잠금 해제 이벤트
 * 레거시: ResetOfficerLock.php
 */
export class ResetOfficerLockEvent implements GameEvent {
  public id = "reset_officer_lock_event";
  public name = "장수 커맨드 잠금 해제";
  public target = EventTarget.MONTH;
  public priority = 10;

  condition(): boolean {
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      generals: {},
    };

    const dGenerals = delta.generals!;
    const generals = Object.values(snapshot.generals);

    for (const g of generals) {
      if (g.officerLock === 1) {
        dGenerals[g.id] = { officerLock: 0 };
      }
    }

    return delta;
  }
}
