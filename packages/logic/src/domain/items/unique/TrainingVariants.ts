/**
 * 훈련 계열 추가 아이템
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class TrainingLiquor2Item extends BaseItem {
  readonly code = "che_훈련_과실주";
  readonly rawName = "과실주";
  readonly name = "과실주(훈련)";
  readonly info = "[내정] 훈련 효과 +40%";
  readonly type = "item" as const;
  readonly cost = 150;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 30;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "훈련" && varType === "score") return value * 1.4;
    return value;
  }
}

export class TrainingLiquor3Item extends BaseItem {
  readonly code = "che_훈련_이강주";
  readonly rawName = "이강주";
  readonly name = "이강주(훈련)";
  readonly info = "[내정] 훈련 효과 +50%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = true;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "훈련" && varType === "score") return value * 1.5;
    return value;
  }
}

export class TrainingBookItem extends BaseItem {
  readonly code = "che_훈련_단결도";
  readonly rawName = "단결도";
  readonly name = "단결도(훈련)";
  readonly info = "[내정] 훈련 효과 +50%, 소모 안함";
  readonly type = "item" as const;
  readonly cost = 500;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "훈련" && varType === "score") return value * 1.5;
    return value;
  }
}

export class TrainingBook2Item extends BaseItem {
  readonly code = "che_훈련_철벽서";
  readonly rawName = "철벽서";
  readonly name = "철벽서(훈련)";
  readonly info = "[내정] 훈련 효과 +60%, 소모 안함";
  readonly type = "item" as const;
  readonly cost = 600;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "훈련" && varType === "score") return value * 1.6;
    return value;
  }
}
