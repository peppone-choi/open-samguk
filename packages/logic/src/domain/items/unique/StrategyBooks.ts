/**
 * 삼략(계략) - che_계략_삼략.php 포팅
 * [계략] 화계·탈취·파괴·선동 : 성공률 +20%p
 * [전투] 계략 시도 확률 +10%p, 계략 성공 확률 +10%p
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName, DomesticTurnType, DomesticVarType } from "../types.js";

export class StrategyBookSamryakItem extends BaseItem {
  readonly code = "che_계략_삼략";
  readonly rawName = "삼략";
  readonly name = "삼략(계략)";
  readonly info =
    "[계략] 화계·탈취·파괴·선동 : 성공률 +20%p\n[전투] 계략 시도 확률 +10%p, 계략 성공 확률 +10%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(
    turnType: DomesticTurnType,
    varType: DomesticVarType,
    value: number,
    _aux?: unknown
  ): number {
    if (turnType === "계략" && varType === "success") {
      return value + 0.2;
    }
    return value;
  }

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warMagicTrialProb") {
      return value + 0.1;
    }
    if (statName === "warMagicSuccessProb") {
      return value + 0.1;
    }
    return value;
  }
}

/**
 * 육도(계략) - che_계략_육도.php 포팅
 */
export class StrategyBookYukdoItem extends BaseItem {
  readonly code = "che_계략_육도";
  readonly rawName = "육도";
  readonly name = "육도(계략)";
  readonly info =
    "[계략] 화계·탈취·파괴·선동 : 성공률 +20%p\n[전투] 계략 시도 확률 +10%p, 계략 성공 확률 +10%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(
    turnType: DomesticTurnType,
    varType: DomesticVarType,
    value: number,
    _aux?: unknown
  ): number {
    if (turnType === "계략" && varType === "success") {
      return value + 0.2;
    }
    return value;
  }

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warMagicTrialProb") {
      return value + 0.1;
    }
    if (statName === "warMagicSuccessProb") {
      return value + 0.1;
    }
    return value;
  }
}
