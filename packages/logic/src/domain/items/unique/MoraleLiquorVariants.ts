/**
 * 두강주/보령압주/의적주/초선화/춘화첩 (사기 계열 술)
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class MoraleLiquor2Item extends BaseItem {
  readonly code = "che_사기_두강주";
  readonly rawName = "두강주";
  readonly name = "두강주(사기)";
  readonly info = "[내정] 사기진작 효과 +40%";
  readonly type = "item" as const;
  readonly cost = 150;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 30;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "사기진작" && varType === "score") return value * 1.4;
    return value;
  }
}

export class MoraleLiquor3Item extends BaseItem {
  readonly code = "che_사기_보령압주";
  readonly rawName = "보령압주";
  readonly name = "보령압주(사기)";
  readonly info = "[내정] 사기진작 효과 +50%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = true;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "사기진작" && varType === "score") return value * 1.5;
    return value;
  }
}

export class MoraleLiquor4Item extends BaseItem {
  readonly code = "che_사기_의적주";
  readonly rawName = "의적주";
  readonly name = "의적주(사기)";
  readonly info = "[내정] 사기진작 효과 +60%";
  readonly type = "item" as const;
  readonly cost = 250;
  readonly consumable = true;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "사기진작" && varType === "score") return value * 1.6;
    return value;
  }
}

export class MoralePicture1Item extends BaseItem {
  readonly code = "che_사기_초선화";
  readonly rawName = "초선화";
  readonly name = "초선화(사기)";
  readonly info = "[내정] 사기진작 효과 +50%, 소모 안함";
  readonly type = "item" as const;
  readonly cost = 500;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "사기진작" && varType === "score") return value * 1.5;
    return value;
  }
}

export class MoralePicture2Item extends BaseItem {
  readonly code = "che_사기_춘화첩";
  readonly rawName = "춘화첩";
  readonly name = "춘화첩(사기)";
  readonly info = "[내정] 사기진작 효과 +60%, 소모 안함";
  readonly type = "item" as const;
  readonly cost = 600;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "사기진작" && varType === "score") return value * 1.6;
    return value;
  }
}
