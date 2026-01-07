import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 전역 기록 로그 출력 이벤트
 * 레거시: NoticeToHistoryLog.php
 */
export class NoticeToHistoryLogEvent implements GameEvent {
  public id = "notice_to_history_log_event";
  public name = "전역 기록 로그 출력";
  public target = EventTarget.MONTH;
  public priority = 10;

  constructor(
    public msg: string,
    public type: string = "YEAR_MONTH"
  ) {}

  condition(): boolean {
    return true;
  }

  action(): WorldDelta {
    return {
      logs: {
        global: [this.msg],
      },
    };
  }
}
