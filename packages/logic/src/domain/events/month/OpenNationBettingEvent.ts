import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 국가 배팅 오픈 이벤트
 * 레거시: OpenNationBetting.php
 */
export class OpenNationBettingEvent implements GameEvent {
  public id = "open_nation_betting_event";
  public name = "국가 배팅 오픈";
  public target = EventTarget.MONTH;
  public priority = 10;

  condition(): boolean {
    return true; // 시나리오나 특정 조건에 의해 트리거됨
  }

  action(): WorldDelta {
    return {
      env: {
        betting: {
          active: true,
          type: 1, // 1: 천통국 맞추기 등
          amount: 1000,
        },
      },
      logs: {
        global: ["<Y>【공지】</>이번 달부터 <C>국가 배팅</>이 시작됩니다!"],
      },
    };
  }
}
