import { GameEvent, EventTarget } from '../types.js';
import { WorldSnapshot, WorldDelta } from '../../entities.js';

export class TestPreMonthEvent implements GameEvent {
  public id = 'test_pre_month_event';
  public name = '테스트 월간 전처리 이벤트';
  public target = EventTarget.PRE_MONTH;
  public priority = 100;

  condition(snapshot: WorldSnapshot): boolean {
    // 항상 실행 (테스트용)
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    return {
      logs: {
        global: ['[이벤트] 월간 전처리 이벤트가 실행되었습니다.'],
      },
    };
  }
}
