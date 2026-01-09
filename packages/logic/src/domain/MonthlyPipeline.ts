import { WorldSnapshot, WorldDelta, GameTime } from "./entities.js";
import { City } from "./models/City.js";
import { Nation } from "./models/Nation.js";
import { EventRegistry, EventTarget } from "./events/types.js";
import { DeltaUtil } from "../utils/DeltaUtil.js";
import { MapUtil } from "./MapData.js";

/**
 * 월간 처리 파이프라인
 * 레거시의 preUpdateMonthly, postUpdateMonthly 로직을 담당함
 */
export class MonthlyPipeline {
  constructor(private eventRegistry: EventRegistry) { }

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
      logs: { global: ["월간 수입 정산을 시작합니다."] },
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

    // 1-3. 환경 변수 (개발비) 갱신
    const startYear = snapshot.env["startyear"] || 184;
    const currentYear = snapshot.gameTime.year;
    const develCost = (currentYear - startYear + 10) * 2;
    if (!delta.env) delta.env = {};
    const dEnv = delta.env!;
    dEnv["develcost"] = develCost;

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

    // 2. 도시 수입 및 장수 봉록은 이제 ProcessIncomeEvent, ProcessWarIncomeEvent 등 이벤트에서 처리됨
    // (레거시와 동일하게 이벤트 기반으로 변경)

    return DeltaUtil.merge(eventDelta, delta);
  }

  /**
   * 게임 시간 전진
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
      env: {
        turntime: now.toISOString(),
      },
      logs: { global: [`${year}년 ${month}월이 되었습니다.`] },
    };

    // 1월인 경우 모든 장수의 나이 증가
    if (month === 1) {
      delta.generals = {};
      const dGenerals = delta.generals!;
      for (const general of Object.values(snapshot.generals)) {
        dGenerals[general.id] = {
          age: general.age + 1,
        };
      }
      delta.logs!.global!.push("모든 장수의 나이가 1살 늘어났습니다.");
    }

    return delta;
  }

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

      // 해당 국가의 도시 수와 질을 기반으로 국력 계산
      const nationCities = Object.values(snapshot.cities).filter((c) => c.nationId === nation.id);
      totalPower += nationCities.length * 100;
      totalPower += nationCities.reduce((acc, c) => acc + c.pop / 1000 + c.agri / 100, 0);

      // 해당 국가의 장수 수와 질 기반
      const nationGenerals = Object.values(snapshot.generals).filter(
        (g) => g.nationId === nation.id
      );
      totalPower += nationGenerals.length * 50;
      totalPower += nationGenerals.reduce(
        (acc, g) => acc + (g.leadership + g.strength + g.intel) / 10,
        0
      );

      let nDelta = dNations[nation.id];
      if (!nDelta) {
        nDelta = {};
        dNations[nation.id] = nDelta;
      }
      nDelta.power = Math.floor(totalPower);
    }

    // 1.5. 외교 상태 갱신 (Legacy: postUpdateMonthly diplomacy logic)
    for (const [key, diplomacy] of Object.entries(snapshot.diplomacy)) {
      const { state, term } = diplomacy;
      let newState = state;
      let newTerm = term;

      // 종전 처리 (state 0 && term <= 1) -> state 2
      if (state === "0" && term <= 1) {
        newState = "2"; // 통상
        newTerm = 0;
      }

      // 기한 감소
      newTerm = Math.max(0, newTerm - 1);

      // 불가침 만료 (state 7 && term 0) -> state 2
      if (newState === "7" && newTerm === 0) {
        newState = "2";
      }

      // 선포 만료 (state 1 && term 0) -> state 0 (교전), term 6
      if (newState === "1" && newTerm === 0) {
        newState = "0";
        newTerm = 6;
      }

      if (newState !== state || newTerm !== term) {
        if (!delta.diplomacy) delta.diplomacy = {};
        delta.diplomacy[key] = { state: newState, term: newTerm };
      }
    }

    // 2. 전선(Front) 설정 (Legacy: SetNationFront)
    // 2-1. 국가별 외교 상태 캐싱
    const nationRelations: Record<number, { enemy: Set<number>; pending: Record<number, number> }> =
      {};
    for (const nation of Object.values(snapshot.nations)) {
      nationRelations[nation.id] = { enemy: new Set(), pending: {} };
    }

    for (const diplomacy of Object.values(snapshot.diplomacy)) {
      const { srcNationId, destNationId, state, term } = diplomacy;
      if (state === "0") {
        // 교전
        if (nationRelations[srcNationId]) nationRelations[srcNationId].enemy.add(destNationId);
        if (nationRelations[destNationId]) nationRelations[destNationId].enemy.add(srcNationId);
      } else if (state === "1") {
        // 선포
        if (nationRelations[srcNationId]) nationRelations[srcNationId].pending[destNationId] = term;
        if (nationRelations[destNationId])
          nationRelations[destNationId].pending[srcNationId] = term;
      }
    }

    // 2-2. 국가별 전선 계산
    for (const nation of Object.values(snapshot.nations)) {
      const relations = nationRelations[nation.id];
      if (!relations) continue;

      const adjEnemy = new Set<number>(); // state=0
      const adjPending = new Set<number>(); // state=1 && term<=5
      const adjNeutral = new Set<number>(); // nation=0

      // 전토 도시 검색
      for (const enemyCity of Object.values(snapshot.cities)) {
        // 교전국 도시인 경우 그 인접 도시들을 adjEnemy에 추가
        if (relations.enemy.has(enemyCity.nationId)) {
          for (const connId of MapUtil.getConnections(enemyCity.id)) {
            adjEnemy.add(connId);
          }
        }
        // 선포국 도시인 경우 (term <= 5)
        const term = relations.pending[enemyCity.nationId];
        if (term !== undefined && term <= 5) {
          for (const connId of MapUtil.getConnections(enemyCity.id)) {
            adjPending.add(connId);
          }
        }
        // 공백지인 경우
        if (enemyCity.nationId === 0) {
          for (const connId of MapUtil.getConnections(enemyCity.id)) {
            adjNeutral.add(connId);
          }
        }
      }

      // 내 국가의 도시들 상태 업데이트
      const myCities = Object.values(snapshot.cities).filter((c) => c.nationId === nation.id);
      for (const city of myCities) {
        let front = 0;
        if (adjEnemy.has(city.id)) {
          front = 3;
        } else if (adjPending.has(city.id)) {
          front = 1;
        } else if (adjNeutral.has(city.id) && adjEnemy.size === 0 && adjPending.size === 0) {
          // 레거시: 평시이면 공백지 인접을 front=2로 설정
          front = 2;
        }

        if (city.front !== front) {
          let cDelta = dCities[city.id];
          if (!cDelta) {
            cDelta = {};
            dCities[city.id] = cDelta;
          }
          cDelta.front = front;
        }
      }
    }

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
