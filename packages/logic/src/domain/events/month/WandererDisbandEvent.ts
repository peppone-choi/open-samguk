import { GameEvent, EventTarget } from '../types.js';
import { WorldSnapshot, WorldDelta } from '../../entities.js';

/**
 * 방랑군 자동 해산 이벤트
 * 레거시: func_gamerule.php checkWander()
 */
export class WandererDisbandEvent implements GameEvent {
  public id = 'wanderer_disband_event';
  public name = '방랑군 자동 해산';
  public target = EventTarget.MONTH;
  public priority = 100;

  condition(snapshot: WorldSnapshot): boolean {
    const startYear = snapshot.env['startyear'] || 184;
    const currentYear = snapshot.gameTime.year;
    
    // 2년차부터 적용 (레거시 규칙)
    if (currentYear < startYear + 2) {
      return false;
    }
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      generals: {},
      logs: {
        general: {},
        global: [],
      },
    };

    const dGenerals = delta.generals as NonNullable<WorldDelta['generals']>;
    // LogDelta properties are optional, so we cast to Required to assume they exist as initialized
    const dLogs = delta.logs as Required<NonNullable<WorldDelta['logs']>>;

    const wandererNations = Object.values(snapshot.nations).filter(n => n.level === 0 && n.id !== 0);
    const wandererNationIds = new Set(wandererNations.map(n => n.id));

    if (wandererNationIds.size === 0) {
      return delta;
    }

    for (const general of Object.values(snapshot.generals)) {
      if (wandererNationIds.has(general.nationId)) {
        if (!dGenerals[general.id]) {
            dGenerals[general.id] = {};
        }
        
        const genDelta = dGenerals[general.id]!;
        // 해산: 소속 없음(0)으로 변경
        genDelta.nationId = 0;
        genDelta.officerLevel = 0; // 평민/장수
        
        if (!dLogs.general) dLogs.general = {};
        const logsMap = dLogs.general;
        
        if (!logsMap[general.id]) logsMap[general.id] = [];
        logsMap[general.id]!.push('초반 제한 기간 경과로 방랑군이 자동 해산되었습니다.');
      }
    }

    // TODO: 국가 상태를 '멸망'으로 처리하는 로직 추가 필요 (delta.nations)
    // 현재는 장수만 빼냄

    if (Object.keys(dGenerals).length > 0) {
      if (!dLogs.global) dLogs.global = [];
      dLogs.global.push(`${wandererNations.map(n => n.name).join(', ')} 방랑군이 해산되었습니다.`);
    }

    return delta;
  }
}
