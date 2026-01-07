import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { GameConst } from "../../GameConst.js";
import { GameUtil } from "../../utils/GameUtil.js";

/**
 * 정기 수입 처리 이벤트 (금: 4월, 쌀: 10월)
 * 레거시: ProcessIncome.php
 */
export class ProcessIncomeEvent implements GameEvent {
  public id = "process_income_event";
  public name = "정기 수입 처리";
  public target = EventTarget.MONTH;
  public priority = 120;

  condition(snapshot: WorldSnapshot): boolean {
    const { month } = snapshot.gameTime;
    return month === 4 || month === 10;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { month } = snapshot.gameTime;
    const isGold = month === 4;
    const resource = isGold ? "gold" : "rice";

    const delta: WorldDelta = {
      nations: {},
      generals: {},
      logs: {
        global: [],
        general: {},
      },
    };

    const dNations = delta.nations!;
    const dGenerals = delta.generals!;
    const dLogs = delta.logs!;

    const nations = Object.values(snapshot.nations);
    const cities = Object.values(snapshot.cities);
    const generals = Object.values(snapshot.generals);

    // 전역 로그 추가
    dLogs.global?.push(
      isGold
        ? "<W><b>【지급】</b></>봄이 되어 봉록에 따라 자금이 지급됩니다."
        : "<W><b>【지급】</b></>가을이 되어 봉록에 따라 군량이 지급됩니다."
    );

    for (const nation of nations) {
      if (nation.id === 0) continue;

      // 1. 국가별 수입 계산
      // (단순화: 국가 총 수입 = 소속 도시 수입의 합)
      // 레거시에서는 좀 더 복잡한 공식(인구, 상업/농업, 치안 등)을 사용함
      let totalIncome = 0;
      const nationCities = cities.filter((c) => c.nationId === nation.id && c.supply === 1);

      for (const city of nationCities) {
        const trustRatio = city.trust / 200 + 0.5; // 0.5 ~ 1.0
        const baseIncome = isGold
          ? (city.pop * city.comm) / city.commMax
          : (city.pop * city.agri) / city.agriMax;

        let income = (baseIncome * trustRatio) / 30;
        income *= 1 + city.secu / city.secuMax / 10;

        // 보너스: 도시에 주둔 중인 장수 수 (관직 2~4등급)
        const cityGenerals = generals.filter(
          (g) =>
            g.nationId === nation.id &&
            g.cityId === city.id &&
            g.officerLevel >= 2 &&
            g.officerLevel <= 4
        );
        income *= Math.pow(1.05, cityGenerals.length);

        // 수도 보너스
        if (city.id === nation.capitalCityId) {
          income *= 1 + 1 / (3 * nation.level);
        }

        // 세율 적용 (세율 20% 기준 1.0배)
        income *= (nation.rate || 20) / 20;

        totalIncome += Math.floor(income);
      }

      // 성벽 수입 (쌀 수종 시 추가)
      if (!isGold) {
        for (const city of nationCities) {
          let wallIncome = (city.def * city.wall) / city.wallMax / 3;
          wallIncome *= 1 + city.secu / city.secuMax / 10;
          totalIncome += Math.floor(wallIncome);
        }
      }

      // 2. 국가 예산 업데이트 및 지불액 계산
      const nationGold = (dNations[nation.id]?.gold ?? nation.gold) || 0;
      const nationRice = (dNations[nation.id]?.rice ?? nation.rice) || 0;
      const currentResource = isGold ? nationGold : nationRice;
      const nextResource = currentResource + totalIncome;

      // 지출 계산 (봉록)
      const nationGenerals = generals.filter((g) => g.nationId === nation.id && g.npc !== 5);
      let totalOutcome = 0;
      for (const g of nationGenerals) {
        totalOutcome += GameUtil.getBill(g.dedication);
      }

      // 실제 지급비율 계산
      let payoutRatio = 1.0;
      let finalPayout = totalOutcome;
      if (nextResource < totalOutcome) {
        finalPayout = Math.max(0, nextResource);
        payoutRatio = totalOutcome > 0 ? finalPayout / totalOutcome : 0;
      }

      // 국가 잔고 반영
      if (!dNations[nation.id]) dNations[nation.id] = {};
      (dNations[nation.id] as any)[resource] = nextResource - finalPayout;

      // 3. 장수별 봉록 지급
      for (const g of nationGenerals) {
        const bill = Math.floor(GameUtil.getBill(g.dedication) * payoutRatio);
        if (!dGenerals[g.id]) dGenerals[g.id] = {};
        const gDelta = dGenerals[g.id];
        (gDelta as any)[resource] = (g as any)[resource] + bill;

        // 개인 로그 추가
        if (!dLogs.general![g.id]) dLogs.general![g.id] = [];
        const resName = isGold ? "금" : "쌀";
        dLogs.general![g.id].push(
          `이번 수입은 ${resName} <C>${totalIncome.toLocaleString()}</>입니다.`
        );
        dLogs.general![g.id].push(
          `봉급으로 ${resName} <C>${bill.toLocaleString()}</>을 받았습니다.`
        );
      }
    }

    return delta;
  }
}
