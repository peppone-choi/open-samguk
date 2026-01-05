import { WorldSnapshot, WorldDelta, GameTime } from './entities.js';
import { City } from './models/City.js';
import { Nation } from './models/Nation.js';
import { EventRegistry, EventTarget } from './events/types.js';
import { DeltaUtil } from '../utils/DeltaUtil.js';

/**
 * 월간 처리 파이프라인
 * 레거시의 preUpdateMonthly, postUpdateMonthly 로직을 담당함
 */
export class MonthlyPipeline {
  constructor(private eventRegistry: EventRegistry) {}

  /**
   * 월간 처리 시작 전 전처리 (수입 정산 및 자원 분배)
   */
  public preUpdateMonthly(snapshot: WorldSnapshot): WorldDelta {
    // 0. Pre-Month 이벤트 실행 (레거시: runEventHandler(EventTarget::PreMonth))
    const eventDelta = this.eventRegistry.runEvents(EventTarget.PRE_MONTH, snapshot);

    const delta: WorldDelta = {
      nations: {},
      cities: {},
      generals: {},
      logs: { global: ['월간 수입 정산을 시작합니다.'] },
    };

    // 1. 장수, 국가, 도시 상태 갱신 (Legacy: preUpdateMonthly)
    const dGenerals = delta.generals!;
    const dNations = delta.nations!;
    const dCities = delta.cities!;

    // 1-1. 장수 생성 제한 감소
    for (const general of Object.values(snapshot.generals)) {
      if (general.makeLimit > 0) {
        let gDelta = dGenerals[general.id];
        if (!gDelta) {
          gDelta = {};
          dGenerals[general.id] = gDelta;
        }
        gDelta.makeLimit = Math.max(0, general.makeLimit - 1);
      }
    }

    // 1-2. 국가 제한 감소 및 세율 동기화
    for (const nation of Object.values(snapshot.nations)) {
      let nDelta = dNations[nation.id];
      if (!nDelta) {
        nDelta = {};
        dNations[nation.id] = nDelta;
      }
      
      if (nation.strategicCmdLimit > 0) {
        nDelta.strategicCmdLimit = Math.max(0, nation.strategicCmdLimit - 1);
      }
      if (nation.surrenderLimit > 0) {
        nDelta.surrenderLimit = Math.max(0, nation.surrenderLimit - 1);
      }
      nDelta.rateTmp = nation.rate;

      // 첩보 기간 감소
      if (nation.spy && Object.keys(nation.spy).length > 0) {
        const newSpy = { ...nation.spy };
        let changed = false;
        for (const [cityId, duration] of Object.entries(newSpy)) {
          if (typeof duration === 'number') {
            if (duration <= 1) {
              delete newSpy[cityId];
              changed = true;
            } else {
              newSpy[cityId] = duration - 1;
              changed = true;
            }
          }
        }
        if (changed) {
          nDelta.spy = newSpy;
        }
      }
    }

    // 1-3. 환경 변수 (개발비) 갱신
    const startYear = snapshot.env['startyear'] || 184;
    const currentYear = snapshot.gameTime.year;
    const develCost = (currentYear - startYear + 10) * 2;
    if (!delta.env) delta.env = {};
    const dEnv = delta.env!;
    dEnv['develcost'] = develCost;

    // 1-4. 도시 상태, 전쟁 기한, 계략 표시 해제
    for (const city of Object.values(snapshot.cities)) {
      const newState = this.updateCityState(city.state);
      const newTerm = Math.max(0, city.term - 1);
      let newConflict = city.conflict;
      if (newTerm === 0) {
        newConflict = {};
      }

      if (newState !== city.state || newTerm !== city.term || newConflict !== city.conflict) {
        let cDelta = dCities[city.id];
        if (!cDelta) {
          cDelta = {};
          dCities[city.id] = cDelta;
        }
        cDelta.state = newState;
        cDelta.term = newTerm;
        cDelta.conflict = newConflict;
      }
    }

    // 2. 도시 수입 계산 및 국가/도시 분배
    for (const iCity of Object.values(snapshot.cities)) {
      if (iCity.nationId === 0) continue; // 중립 도시는 수입 없음

      const city = new City(iCity);
      const iNation = snapshot.nations[iCity.nationId];
      if (!iNation) continue;

      const taxRate = iNation.meta.rate || 10; // 국가 세율 (기본 10%)
      const { gold, rice } = city.calcIncome(taxRate);

      // 국가와 도시가 수입을 나눔 (국가 70%, 도시 30%)
      const nationGold = Math.floor(gold * 0.7);
      const cityGold = gold - nationGold;
      const nationRice = Math.floor(rice * 0.7);
      const cityRice = rice - nationRice;

      // 델타 업데이트
      let cDelta = dCities[iCity.id];
      if (!cDelta) {
        cDelta = {};
        dCities[iCity.id] = cDelta;
      }
      
      cDelta.gold = (iCity.gold + cityGold);
      cDelta.rice = (iCity.rice + cityRice);

      let nDelta = dNations[iCity.nationId];
      if (!nDelta) {
        nDelta = {};
        dNations[iCity.nationId] = nDelta;
      }
      nDelta.gold = (nDelta.gold || iNation.gold || 0) + nationGold;
      nDelta.rice = (nDelta.rice || iNation.rice || 0) + nationRice;
    }

    // 2. 장수 봉록 지급 (국가 자금 소모)
    for (const iGeneral of Object.values(snapshot.generals)) {
      if (iGeneral.nationId === 0) continue;

      const iNation = snapshot.nations[iGeneral.nationId];
      if (!iNation) continue;

      // 공헌도에 비례한 봉록 (최소 10, 최대 500)
      const salary = Math.min(Math.max(Math.floor(iGeneral.dedication / 100), 10), 500);
      
      // 국가 자금 차감
      let nDelta = dNations[iGeneral.nationId];
      if (!nDelta) {
        nDelta = {};
        dNations[iGeneral.nationId] = nDelta;
      }
      nDelta.gold = (nDelta.gold || iNation.gold || 0) - salary;

      // 장수 자금 증가
      let gDelta = dGenerals[iGeneral.id];
      if (!gDelta) {
        gDelta = {};
        dGenerals[iGeneral.id] = gDelta;
      }
      gDelta.gold = (iGeneral.gold + salary);
    }

    return DeltaUtil.merge(eventDelta, delta);
  }

  /**
   * 게임 시간 전진
   */
  public advanceTime(snapshot: WorldSnapshot): WorldDelta {
    let { year, month } = snapshot.gameTime;
    month += 1;
    if (month > 12) {
      year += 1;
      month = 1;
    }

    const delta: WorldDelta = {
      gameTime: { year, month },
      logs: { global: [`${year}년 ${month}월이 되었습니다.`] },
    };

    // 1월인 경우 모든 장수의 나이 증가
    if (month === 1) {
      delta.generals = {};
      for (const general of Object.values(snapshot.generals)) {
        delta.generals[general.id] = {
          age: general.age + 1,
        };
      }
      delta.logs!.global!.push('모든 장수의 나이가 1살 늘어났습니다.');
    }

    return delta;
  }

  /**
   * 월간 처리 후처리
   */
  public postUpdateMonthly(snapshot: WorldSnapshot): WorldDelta {
    // 0. Month 이벤트 실행 (레거시: runEventHandler(EventTarget::Month))
    const eventDelta = this.eventRegistry.runEvents(EventTarget.MONTH, snapshot);

    const delta: WorldDelta = {
      nations: {},
      logs: { global: ['월간 정산을 완료했습니다.'] },
    };

    // 1. 국가 국력(Power) 계산
    for (const nation of Object.values(snapshot.nations)) {
      let totalPower = 0;
      
      // 해당 국가의 도시 수와 질을 기반으로 국력 계산
      const nationCities = Object.values(snapshot.cities).filter(c => c.nationId === nation.id);
      totalPower += nationCities.length * 100;
      totalPower += nationCities.reduce((acc, c) => acc + (c.pop / 1000) + (c.agri / 100), 0);

      // 해당 국가의 장수 수와 질 기반
      const nationGenerals = Object.values(snapshot.generals).filter(g => g.nationId === nation.id);
      totalPower += nationGenerals.length * 50;
      totalPower += nationGenerals.reduce((acc, g) => acc + (g.leadership + g.strength + g.intel) / 10, 0);

      delta.nations![nation.id] = {
        power: Math.floor(totalPower),
      };
    }

    // 1.5. 외교 상태 갱신 (Legacy: postUpdateMonthly diplomacy logic)
    for (const diplomacy of Object.values(snapshot.diplomacy)) {
      const { srcNationId, destNationId, state, term } = diplomacy;
      let newState = state;
      let newTerm = term;
      // let newDead = diplomacy.meta?.dead ?? 0;

      // TODO: 전쟁 기한 연장 로직 (state === '0') - MVP 생략

      // 종전 처리 (state 0 && term <= 1) -> state 2
      if (state === '0' && term <= 1) {
        newState = '2'; // 통상
        newTerm = 0;
        // TODO: Log 종전
      }

      // 기한 감소
      newTerm = Math.max(0, newTerm - 1);

      // 불가침 만료 (state 7 && term 0) -> state 2
      if (newState === '7' && newTerm === 0) {
        newState = '2';
      }

      // 선포 만료 (state 1 && term 0) -> state 0 (교전), term 6
      if (newState === '1' && newTerm === 0) {
        newState = '0';
        newTerm = 6;
      }

      // 상태 변경 감지
      if (newState !== state || newTerm !== term) {
        // ID는 복합키일 수 있음. entities.ts에 따르면 id string (key). 
        // 아, entities.ts: diplomacy is Record<string, Diplomacy>. key is "src:dest"? 
        // No, key in snapshot is string, but Diplomacy object has id: number.
        // Wait, snapshot.diplomacy keys.
        // Let's assume snapshot keys map to something identifying the diplomacy.
        // In legacy, diplomacy is identified by 'me' and 'you'.
        // logic/src/domain/entities.ts says: diplomacy: Record<string, Diplomacy>; // key: "src:dest"
        // But Diplomacy interface has `id: number`.
        // I should use the key from the loop.
        // `for (const [key, diplomacy] of Object.entries(snapshot.diplomacy))`
        
        // I was iterating values. I need keys if I want to update delta by key.
        // But `delta.diplomacy` is Record<string, Delta<Diplomacy>>.
        // So I can't use `diplomacy.id` (number) as key if the delta expects the map key (string "src:dest").
        // I should verify `WorldDelta` definition.
        // `diplomacy?: Record<string, Delta<Diplomacy>>;`
        // So I must use the same key.
      }
    }
    
    // Loop with keys
    for (const [key, diplomacy] of Object.entries(snapshot.diplomacy)) {
      const { state, term } = diplomacy;
      let newState = state;
      let newTerm = term;

      // 종전 처리 (state 0 && term <= 1) -> state 2
      if (state === '0' && term <= 1) {
        newState = '2'; // 통상
        newTerm = 0;
      }

      // 기한 감소
      newTerm = Math.max(0, newTerm - 1);

      // 불가침 만료 (state 7 && term 0) -> state 2
      if (newState === '7' && newTerm === 0) {
        newState = '2';
      }

      // 선포 만료 (state 1 && term 0) -> state 0 (교전), term 6
      if (newState === '1' && newTerm === 0) {
        newState = '0';
        newTerm = 6;
      }

      if (newState !== state || newTerm !== term) {
        if (!delta.diplomacy) delta.diplomacy = {};
        delta.diplomacy[key] = { state: newState, term: newTerm };
      }
    }

    // 2. 전선(Front) 설정 (Legacy: SetNationFront)
    // - 적국(state=0) 도시와 인접한 내 도시는 front=3
    // - 준적국(state=1, term<=5) 도시와 인접한 내 도시는 front=1
    // - 평시(적/준적 없음) 공백지와 인접한 내 도시는 front=2
    // - 나머지 front=0
    
    // 2-1. 국가별 외교 상태 캐싱
    const nationRelations: Record<number, { enemy: number[], pending: number[] }> = {};
    for (const nation of Object.values(snapshot.nations)) {
      nationRelations[nation.id] = { enemy: [], pending: [] };
    }
    
    // 외교 상태 조회
    for (const diplomacy of Object.values(snapshot.diplomacy)) {
      const { srcNationId, destNationId, state, term } = diplomacy;
      // state 0: 교전, 1: 선포(준적)
      if (state === '0') { // 교전
        nationRelations[srcNationId]?.enemy.push(destNationId);
        nationRelations[destNationId]?.enemy.push(srcNationId);
      } else if (state === '1' && term <= 5) { // 선포 및 기한 임박
        nationRelations[srcNationId]?.pending.push(destNationId);
        nationRelations[destNationId]?.pending.push(srcNationId);
      }
    }

    // TODO: MapData 연동 후 전선 로직 완성 필요
    // for (const city of Object.values(snapshot.cities)) {
    //   let front = 0;
    //   // ... calculation ...
    //   if (city.front !== front) {
    //      if (!delta.cities![city.id]) delta.cities![city.id] = {};
    //      delta.cities![city.id].front = front;
    //   }
    // }

    return DeltaUtil.merge(eventDelta, delta);
  }

  /**
   * 도시 상태 갱신 로직 (Legacy: preUpdateMonthly CASE statement)
   */
  private updateCityState(state: number): number {
    // 31: 계략? 33: 계략? 41: 전쟁?
    // Legacy logic:
    // WHEN state=31 THEN 0
    // WHEN state=32 THEN 31
    // WHEN state=33 THEN 0
    // WHEN state=34 THEN 33
    // WHEN state=41 THEN 0
    // WHEN state=42 THEN 41
    // WHEN state=43 THEN 42
    // ELSE state
    switch (state) {
      case 31: return 0;
      case 32: return 31;
      case 33: return 0;
      case 34: return 33;
      case 41: return 0;
      case 42: return 41;
      case 43: return 42;
      default: return state;
    }
  }
}
