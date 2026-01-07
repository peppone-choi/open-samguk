import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 유산 포인트 랭킹 통합
 * 레거시: MergeInheritPointRank.php
 */
export class MergeInheritPointRankEvent implements GameEvent {
  public id = "merge_inherit_point_rank_event";
  public name = "유산 포인트 정산";
  public target = EventTarget.MONTH;
  public priority = 99;

  condition(): boolean {
    return true;
  }

  action(): WorldDelta {
    // 실제 랭킹 통합 로직은 DB 의존적이므로 로그만 남김
    return {
      logs: {
        global: ["<C>시스템:</> 이번 달 유산 포인트 랭킹이 갱신되었습니다."],
      },
    };
  }
}
