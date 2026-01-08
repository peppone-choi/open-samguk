import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

const MAX_TECH_LEVEL = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getRelativeYear(currentYear: number, startYear: number): number {
  return currentYear - startYear;
}

function calcYearBonus(relYear: number): number {
  return clamp(Math.floor(relYear / 4), 0, MAX_TECH_LEVEL);
}

export class StrengthBoostLiquorItem extends BaseItem {
  readonly code = "che_능력치_무력_두강주";
  readonly rawName = "두강주";
  readonly name = "두강주(무력)";
  readonly info = "[능력치] 무력 +5 +(4년마다 +1)";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  private yearBonus = 0;

  setGameYear(currentYear: number, startYear: number): void {
    this.yearBonus = calcYearBonus(getRelativeYear(currentYear, startYear));
  }

  onCalcStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    aux?: { year?: number; startYear?: number }
  ): number {
    if (statName === "strength") {
      const bonus =
        aux?.year !== undefined && aux?.startYear !== undefined
          ? calcYearBonus(getRelativeYear(aux.year, aux.startYear))
          : this.yearBonus;
      return value + 5 + bonus;
    }
    return value;
  }
}

export class IntelBoostLiquorItem extends BaseItem {
  readonly code = "che_능력치_지력_이강주";
  readonly rawName = "이강주";
  readonly name = "이강주(지력)";
  readonly info = "[능력치] 지력 +5 +(4년마다 +1)";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  private yearBonus = 0;

  setGameYear(currentYear: number, startYear: number): void {
    this.yearBonus = calcYearBonus(getRelativeYear(currentYear, startYear));
  }

  onCalcStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    aux?: { year?: number; startYear?: number }
  ): number {
    if (statName === "intel") {
      const bonus =
        aux?.year !== undefined && aux?.startYear !== undefined
          ? calcYearBonus(getRelativeYear(aux.year, aux.startYear))
          : this.yearBonus;
      return value + 5 + bonus;
    }
    return value;
  }
}

export class LeadershipBoostLiquorItem extends BaseItem {
  readonly code = "che_능력치_통솔_보령압주";
  readonly rawName = "보령압주";
  readonly name = "보령압주(통솔)";
  readonly info = "[능력치] 통솔 +5 +(4년마다 +1)";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  private yearBonus = 0;

  setGameYear(currentYear: number, startYear: number): void {
    this.yearBonus = calcYearBonus(getRelativeYear(currentYear, startYear));
  }

  onCalcStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    aux?: { year?: number; startYear?: number }
  ): number {
    if (statName === "leadership") {
      const bonus =
        aux?.year !== undefined && aux?.startYear !== undefined
          ? calcYearBonus(getRelativeYear(aux.year, aux.startYear))
          : this.yearBonus;
      return value + 5 + bonus;
    }
    return value;
  }
}
