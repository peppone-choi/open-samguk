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

    // 1. 도시 수입 계산 및 국가/도시 분배
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
      delta.cities![iCity.id] = {
        gold: iCity.gold + cityGold,
        rice: iCity.rice + cityRice,
      };

      if (!delta.nations![iCity.nationId]) {
        delta.nations![iCity.nationId] = { gold: iNation.gold, rice: iNation.rice };
      }
      
      const nDelta = delta.nations![iCity.nationId]!;
      nDelta.gold = (nDelta.gold || 0) + nationGold;
      nDelta.rice = (nDelta.rice || 0) + nationRice;
    }

    // 2. 장수 봉록 지급 (국가 자금 소모)
    for (const iGeneral of Object.values(snapshot.generals)) {
      if (iGeneral.nationId === 0) continue;

      const iNation = snapshot.nations[iGeneral.nationId];
      if (!iNation) continue;

      // 공헌도에 비례한 봉록 (최소 10, 최대 500)
      const salary = Math.min(Math.max(Math.floor(iGeneral.dedication / 100), 10), 500);
      
      // 국가 자금 차감
      if (!delta.nations![iGeneral.nationId]) {
        delta.nations![iGeneral.nationId] = { gold: iNation.gold, rice: iNation.rice };
      }
      const nDelta = delta.nations![iGeneral.nationId]!;
      nDelta.gold = (nDelta.gold || 0) - salary;

      // 장수 자금 증가
      delta.generals![iGeneral.id] = {
        gold: iGeneral.gold + salary,
      };
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

    return DeltaUtil.merge(eventDelta, delta);
  }
}
