import { RandUtil } from '@sammo-ts/common';
import { WorldSnapshot, WorldDelta, General, City } from './entities.js';

/**
 * 전투 유닛 인터페이스
 */
export interface WarUnit {
  general: General;
  city?: City;
  // 레거시: WarUnitCity, WarUnitGeneral 클래스들로 분화될 예정
}

/**
 * 전투 결과 요약
 */
export interface WarResult {
  delta: WorldDelta;
  battleLog: string[];
  victory: boolean;
}

/**
 * 전투 엔진
 * 레거시: processWar_NG 로직의 TS 이식판
 */
export class WarEngine {
  /**
   * 공격 전투 실행
   */
  public executeBattle(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    attackerId: number,
    destCityId: number
  ): WarResult {
    const battleLog: string[] = [];
    const delta: WorldDelta = {
      generals: {},
      cities: {},
      logs: { general: {}, global: [] },
    };

    const attacker = snapshot.generals[attackerId];
    const city = snapshot.cities[destCityId];

    if (!attacker || !city) {
      return { delta, battleLog: ['전투 대상을 찾을 수 없습니다.'], victory: false };
    }

    battleLog.push(`${attacker.name} 부대가 ${city.name} 성을 공격합니다!`);

    // 1. 수비진 추출 (도시 수비군 + 수비 장수들)
    // TODO: 레거시 extractBattleOrder() 구현 필요

    // 2. 전투 루프 (최대 100페이즈)
    // TODO: 레거시 processWar_NG_Loop() 구현 필요
    
    // 임시 로직: 공격 성공 판정
    const victory = rng.nextBool(0.5);
    if (victory) {
      battleLog.push(`${city.name} 성을 점령하였습니다!`);
      // 점령 시 도시 소속 변경
      delta.cities![city.id] = { nationId: attacker.nationId };
    } else {
      battleLog.push('공격에 실패하여 퇴각합니다.');
    }

    return { delta, battleLog, victory };
  }
}
