import type { General } from "../entities";
import type {
  BaseSpecial as IBaseSpecial,
  GeneralTriggerCaller,
  WarUnitTriggerCaller,
  WarUnit,
  DomesticAux,
  StatAux,
} from "./types";

/**
 * Abstract base class for special abilities
 * Provides default implementations for all special ability methods
 */
export abstract class BaseSpecial implements IBaseSpecial {
  abstract id: number;
  abstract name: string;
  abstract info: string;

  getName(): string {
    return this.name;
  }

  getInfo(): string {
    return this.info || "";
  }

  getPreTurnExecuteTriggerList(_general: General): GeneralTriggerCaller | null {
    return null;
  }

  onCalcDomestic(
    _turnType: string,
    _varType: string,
    value: number,
    _aux?: DomesticAux,
  ): number {
    return value;
  }

  onCalcStat(
    _general: General,
    _statName: string,
    value: any,
    _aux?: StatAux,
  ): any {
    return value;
  }

  onCalcOpposeStat(
    _general: General,
    _statName: string,
    value: any,
    _aux?: StatAux,
  ): any {
    return value;
  }

  onCalcStrategic(_turnType: string, _varType: string, value: any): any {
    return value;
  }

  onCalcNationalIncome(_type: string, amount: number): number {
    return amount;
  }

  getWarPowerMultiplier(_unit: WarUnit): [number, number] {
    return [1, 1];
  }

  getBattleInitSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    return null;
  }

  getBattlePhaseSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    return null;
  }

  onArbitraryAction(
    _general: General,
    _actionType: string,
    _phase?: string | null,
    aux?: any,
  ): any {
    return aux;
  }
}
