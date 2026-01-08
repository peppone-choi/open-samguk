/**
 * 평만지장도(전략) - che_전략_평만지장도.php 포팅
 * [전략] 국가전략 사용시 재사용 대기 기간 -20%
 */
import { BaseItem } from "../BaseItem.js";

export class StrategyMapItem extends BaseItem {
  readonly code = "che_전략_평만지장도";
  readonly rawName = "평만지장도";
  readonly name = "평만지장도(전략)";
  readonly info = "[전략] 국가전략 사용시 재사용 대기 기간 -20%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStrategic(_turnType: string, varType: string, value: number): number {
    if (varType === "delay") {
      return Math.round(value * 0.8);
    }
    return value;
  }
}
