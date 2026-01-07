import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 신년 이벤트
 * 레거시: NewYear.php
 *
 * 매년 1월에 실행됩니다.
 * - 전체 장수의 나이 증가
 * - 임관 장수의 호봉(belong) 증가
 * - 신년 메시지 출력
 */
export class NewYearEvent implements GameEvent {
  public id = "new_year_event";
  public name = "신년";
  public target = EventTarget.MONTH;
  public priority = 10; // 월초 가장 먼저 실행

  condition(snapshot: WorldSnapshot): boolean {
    return snapshot.gameTime.month === 1;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { year } = snapshot.gameTime;

    const delta: WorldDelta = {
      generals: {},
      logs: {
        global: [
          `<C>${year}</>년이 되었습니다.`,
          "<S>모두들 즐거운 게임 하고 계신가요? ^^ <Y>매너 있는 플레이</> 부탁드리고, 게임보단 <L>건강이 먼저</>란점, 잊지 마세요!</>",
        ],
      },
    };

    const dGenerals = delta.generals!;

    for (const general of Object.values(snapshot.generals)) {
      dGenerals[general.id] = {
        age: (general.age || 0) + 1,
      };

      if (general.nationId !== 0) {
        dGenerals[general.id].belong = (general.belong || 0) + 1;
      }
    }

    return delta;
  }
}
