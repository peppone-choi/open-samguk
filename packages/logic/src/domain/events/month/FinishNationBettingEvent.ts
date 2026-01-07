import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 국가 배팅 종료 및 정산 이벤트
 * 레거시: FinishNationBetting.php
 */
export class FinishNationBettingEvent implements GameEvent {
  public id = "finish_nation_betting_event";
  public name = "국가 배팅 정산";
  public target = EventTarget.MONTH;
  public priority = 95;

  condition(snapshot: WorldSnapshot): boolean {
    // 특정 연도/월 또는 천하통일 직전 등에 발동
    return !!snapshot.env.betting?.active;
  }

  action(): WorldDelta {
    return {
      env: {
        betting: {
          active: false,
        },
      },
      logs: {
        global: ["<Y>【공지】</>국가 배팅이 종료되었습니다. 정산 결과는 메시지를 확인하세요!"],
      },
    };
  }
}
