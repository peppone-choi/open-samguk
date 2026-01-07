import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 이민족 엔딩 (이민족 천하통일 또는 특정 조건 종료)
 * 레거시: InvaderEnding.php
 */
export class InvaderEndingEvent implements GameEvent {
  public id = "invader_ending_event";
  public name = "이민족 엔딩";
  public target = EventTarget.MONTH;
  public priority = 100;

  condition(snapshot: WorldSnapshot): boolean {
    // 이민족이 천하통일급 상태일 때
    return false; // 기본적으로 꺼둠
  }

  action(): WorldDelta {
    return {
      logs: {
        global: ["<R><b>【엔딩】</b></>이민족이 중원을 장악했습니다... 게임이 종료됩니다."],
      },
    };
  }
}
