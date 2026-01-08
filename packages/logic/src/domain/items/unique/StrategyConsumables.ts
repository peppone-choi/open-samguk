/**
 * 계략 소모품 아이템 - che_계략_이추.php, che_계략_향낭.php 포팅
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, DomesticTurnType, DomesticVarType } from "../types.js";

/**
 * 이추(계략) - che_계략_이추.php 포팅
 * [계략] 화계·탈취·파괴·선동 : 성공률 +20%p
 * 소모품 (사용 시 소비됨)
 */
export class StrategyPouchItem extends BaseItem {
  readonly code = "che_계략_이추";
  readonly rawName = "이추";
  readonly name = "이추(계략)";
  readonly info = "[계략] 화계·탈취·파괴·선동 : 성공률 +20%p";
  readonly type = "item" as const;
  readonly cost = 1000;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 1000;

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

  tryConsumeNow(_general: GeneralReadOnly, actionType: string, command: string): boolean {
    return actionType === "GeneralCommand" && command === "계략";
  }
}

/**
 * 향낭(계략) - che_계략_향낭.php 포팅
 * [계략] 화계·탈취·파괴·선동 : 성공률 +50%p
 * 소모품 (사용 시 소비됨)
 */
export class StrategyBagItem extends BaseItem {
  readonly code = "che_계략_향낭";
  readonly rawName = "향낭";
  readonly name = "향낭(계략)";
  readonly info = "[계략] 화계·탈취·파괴·선동 : 성공률 +50%p";
  readonly type = "item" as const;
  readonly cost = 3000;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 2000;

  onCalcDomestic(
    turnType: DomesticTurnType,
    varType: DomesticVarType,
    value: number,
    _aux?: unknown
  ): number {
    if (turnType === "계략" && varType === "success") {
      return value + 0.5;
    }
    return value;
  }

  tryConsumeNow(_general: GeneralReadOnly, actionType: string, command: string): boolean {
    return actionType === "GeneralCommand" && command === "계략";
  }
}
