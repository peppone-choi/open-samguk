import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { LiteHashDRBG, RandUtil } from "@sammo/common";

/**
 * 도시 시세 무작위화 이벤트
 * 레거시: RandomizeCityTradeRate.php
 *
 * 매월 실행되며, 도의 규모에 따라 시세가 무작위로 변동됩니다.
 * 규모가 클수록 시세가 발생할 확률이 높습니다 (규모 8은 100%, 4 이하는 0%).
 */
export class RandomizeCityTradeRateEvent implements GameEvent {
  public id = "randomize_city_trade_rate_event";
  public name = "도시 시세 무작위화";
  public target = EventTarget.MONTH;
  public priority = 30;

  condition(): boolean {
    return true; // 매달 실행
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      cities: {},
    };

    const dCities = delta.cities!;
    const { year, month } = snapshot.gameTime;
    const hiddenSeed = snapshot.env.hiddenSeed || "default-seed";

    const seed = `${hiddenSeed}:randomizeCityTradeRate:${year}:${month}`;
    const rng = new RandUtil(new LiteHashDRBG(seed));

    const levelProb: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0.2,
      5: 0.4,
      6: 0.6,
      7: 0.8,
      8: 1.0,
    };

    for (const city of Object.values(snapshot.cities)) {
      const prob = levelProb[city.level] || 0;
      let trade: number | null = null;

      if (prob > 0 && rng.nextBool(prob)) {
        trade = rng.nextRangeInt(95, 105);
      }

      if (trade !== (city.meta?.trade ?? null)) {
        dCities[city.id] = {
          meta: {
            ...city.meta,
            trade,
          },
        };
      }
    }

    return delta;
  }
}
