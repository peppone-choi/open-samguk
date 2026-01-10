import { WorldSnapshot, WorldDelta, GameTime } from "./entities.js";
import { EventTarget } from "./events/types.js";
import { DeltaUtil } from "../utils/DeltaUtil.js";
import { MapUtil } from "./MapData.js";
import { GameConst } from "./GameConst.js";

/**
 * 월간 처리 파이프라인
 * 레거시의 preUpdateMonthly, postUpdateMonthly 로직을 담당합니다.
 * 매달 게임 연월이 바뀔 때 실행되는 전역적인 업데이트 로직을 관장합니다.
 */
export class MonthlyPipeline {
  constructor(private readonly eventRegistry: any) {}

  /**
   * 월간 처리 시작 전 전처리 (수입 정산 및 자원 분배 준비)
   */
  public preUpdateMonthly(snapshot: WorldSnapshot): WorldDelta {
    // 0. Pre-Month 이벤트 실행 (레거시: runEventHandler(EventTarget::PreMonth))
    const eventDelta = this.eventRegistry.runEvents(EventTarget.PRE_MONTH, snapshot);

    const delta: WorldDelta = {
      nations: {},
      cities: {},
      generals: {},
      logs: { global: ["월간 수입 정산을 시작합니다."] },
    };

    const dGenerals = delta.generals!;
    const dNations = delta.nations!;
    const dCities = delta.cities!;

    // 1-1. 장수 생성 제한(makeLimit) 감소
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

    // 1-2. 국가 제한(전략 명령, 항복 등) 감소 및 세율 동기화
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
          if (typeof duration === "number") {
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

    // 1-3. 환경 변수 (개발비 develcost) 갱신
    const startYear = snapshot.env["startyear"] || 184;
    const currentYear = snapshot.gameTime.year;
    const develCost = (currentYear - startYear + 10) * 2;
    if (!delta.env) delta.env = {};
    delta.env["develcost"] = develCost;

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

    return DeltaUtil.merge(eventDelta, delta);
  }

  /**
   * 월간 처리 후처리 (국력 계산, 외교 갱신, 전선 설정 등)
   */
  public postUpdateMonthly(snapshot: WorldSnapshot): WorldDelta {
    // 0. Month 이벤트 실행 (레거시: runEventHandler(EventTarget::Month))
    const eventDelta = this.eventRegistry.runEvents(EventTarget.MONTH, snapshot);

    const delta: WorldDelta = {
      nations: {},
      cities: {},
      logs: { global: ["월간 정산을 완료했습니다."] },
    };

    const dNations = delta.nations!;
    const dCities = delta.cities!;

    // 1. 국가 국력(Power) 계산
    for (const nation of Object.values(snapshot.nations)) {
      let totalPower = 0;
      const nationCities = Object.values(snapshot.cities).filter((c) => c.nationId === nation.id);
      totalPower += nationCities.length * 100;
      totalPower += nationCities.reduce((acc, c) => acc + c.pop / 1000 + c.agri / 100, 0);

      const nationGenerals = Object.values(snapshot.generals).filter(
        (g) => g.nationId === nation.id
      );
      totalPower += nationGenerals.length * 50;
      totalPower += nationGenerals.reduce(
        (acc, g) => acc + (g.leadership + g.strength + g.intel) / 10,
        0
      );

      dNations[nation.id] = { ...dNations[nation.id], power: Math.floor(totalPower) };
    }

    // 1.5. 외교 상태 갱신
    for (const [key, diplomacy] of Object.entries(snapshot.diplomacy)) {
      const { state, term } = diplomacy;
      let newState = state;
      let newTerm = term;

      if (state === "0" && term <= 1) {
        newState = "2"; // 통상
        newTerm = 0;
      }

      newTerm = Math.max(0, newTerm - 1);

      if (newState === "7" && newTerm === 0) newState = "2";
      if (newState === "1" && newTerm === 0) {
        newState = "0"; // 교전
        newTerm = 6;
      }

      if (newState !== state || newTerm !== term) {
        if (!delta.diplomacy) delta.diplomacy = {};
        delta.diplomacy[key] = { state: newState, term: newTerm };
      }
    }

    // 2. 전선(Front) 설정
    for (const nation of Object.values(snapshot.nations)) {
      const myCities = Object.values(snapshot.cities).filter((c) => c.nationId === nation.id);
      for (const city of myCities) {
        let front = 0;
        // 인접한 적국/중립 도시 확인 로직 (간략화됨)
        const connections = MapUtil.getConnections(city.id);
        for (const connId of connections) {
          const adjCity = snapshot.cities[connId];
          if (!adjCity) continue;
          if (adjCity.nationId === 0) front = Math.max(front, 2);
          else if (adjCity.nationId !== nation.id) front = Math.max(front, 3);
        }

        if (city.front !== front) {
          dCities[city.id] = { ...dCities[city.id], front };
        }
      }
    }

    return DeltaUtil.merge(eventDelta, delta);
  }

  /**
   * 게임 연월을 한 달 증가시킵니다.
   */
  public advanceTime(snapshot: WorldSnapshot, now: Date): WorldDelta {
    let { year, month } = snapshot.gameTime;
    month += 1;
    if (month > 12) {
      year += 1;
      month = 1;
    }

    const delta: WorldDelta = {
      gameTime: { year, month },
      env: { turntime: now.toISOString() },
      logs: { global: [`${year}년 ${month}월이 되었습니다.`] },
    };

    // 1월인 경우 모든 장수의 나이 증가
    if (month === 1) {
      delta.generals = {};
      for (const general of Object.values(snapshot.generals)) {
        delta.generals[general.id] = { age: general.age + 1 };
      }
      delta.logs!.global!.push("모든 장수의 나이가 1살 늘어났습니다.");
    }

    return delta;
  }

  /**
   * 도시의 상태값을 매달 한 단계씩 완화하거나 해제합니다.
   */
  private updateCityState(state: number): number {
    switch (state) {
      case 31:
        return 0;
      case 32:
        return 31;
      case 33:
        return 0;
      case 34:
        return 33;
      case 41:
        return 0;
      case 42:
        return 41;
      case 43:
        return 42;
      default:
        return state;
    }
  }
}
