/**
 * 주서음부(농성) - che_농성_주서음부.php 포팅
 * [계략] 장수 주둔 도시 화계·탈취·파괴·선동 : 성공률 -30%p
 * [전투] 상대 계략 시도 확률 -10%p, 상대 계략 성공 확률 -10%p
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName, DomesticTurnType, DomesticVarType } from "../types.js";

export class SiegeDefenseBookItem extends BaseItem {
  readonly code = "che_농성_주서음부";
  readonly rawName = "주서음부";
  readonly name = "주서음부(농성)";
  readonly info =
    "[계략] 장수 주둔 도시 화계·탈취·파괴·선동 : 성공률 -30%p\n[전투] 상대 계략 시도 확률 -10%p, 상대 계략 성공 확률 -10%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    // sabotageDefence: 장수 주둔 도시의 계략 방어 보너스
    if (statName === "sabotageDefence") {
      return value + 0.3;
    }
    return value;
  }

  onCalcOpposeStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    if (statName === "warMagicTrialProb") {
      return value - 0.1;
    }
    if (statName === "warMagicSuccessProb") {
      return value - 0.1;
    }
    return value;
  }
}
