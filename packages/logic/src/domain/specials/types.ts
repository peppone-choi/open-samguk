import type { General } from '../entities';

/**
 * Special ability weight types for selection probability
 */
export enum SpecialWeightType {
  NORM = 1, // Normal weight-based selection
  PERCENT = 2, // Percentage-based selection
}

/**
 * Special ability type flags for stat-based conditions
 */
export enum SpecialType {
  DISABLED = 0x1,

  STAT_LEADERSHIP = 0x2,
  STAT_STRENGTH = 0x4,
  STAT_INTEL = 0x8,

  ARMY_FOOTMAN = 0x100,
  ARMY_ARCHER = 0x200,
  ARMY_CAVALRY = 0x400,
  ARMY_WIZARD = 0x800,
  ARMY_SIEGE = 0x1000,

  REQ_DEXTERITY = 0x4000,

  STAT_NOT_LEADERSHIP = 0x20000,
  STAT_NOT_STRENGTH = 0x40000,
  STAT_NOT_INTEL = 0x80000,
}

/**
 * War unit for battle calculations
 */
export interface WarUnit {
  general: General;
  crew: number;
  crewType: number;
  train: number;
  atmos: number;
  dex: Record<number, number>;
  oppose?: WarUnit | WarUnitCity;
  battleLog: WarBattleLogEntry[];

  getGeneral(): General;
  getOppose(): WarUnit | WarUnitCity | undefined;
  hasActivatedSkillOnLog(skillName: string): number;
}

/**
 * City unit for battle calculations
 */
export interface WarUnitCity {
  def: number;
  wall: number;
  trust: number;
}

/**
 * Battle log entry
 */
export interface WarBattleLogEntry {
  phase: number;
  type: string;
  skillName?: string;
  activated?: boolean;
  damage?: number;
  [key: string]: any;
}

/**
 * War unit trigger for skill activation
 */
export interface WarUnitTrigger {
  unit: WarUnit;
  process(context: WarContext): void;
}

/**
 * War unit trigger caller to manage multiple triggers
 */
export class WarUnitTriggerCaller {
  private triggers: WarUnitTrigger[];

  constructor(...triggers: WarUnitTrigger[]) {
    this.triggers = triggers;
  }

  getTriggers(): WarUnitTrigger[] {
    return this.triggers;
  }

  execute(context: WarContext): void {
    for (const trigger of this.triggers) {
      trigger.process(context);
    }
  }
}

/**
 * General trigger for pre-turn execution
 */
export interface GeneralTrigger {
  general: General;
  process(context: GeneralContext): void;
}

/**
 * General trigger caller to manage multiple triggers
 */
export class GeneralTriggerCaller {
  private triggers: GeneralTrigger[];

  constructor(...triggers: GeneralTrigger[]) {
    this.triggers = triggers;
  }

  getTriggers(): GeneralTrigger[] {
    return this.triggers;
  }

  execute(context: GeneralContext): void {
    for (const trigger of this.triggers) {
      trigger.process(context);
    }
  }
}

/**
 * War context for battle calculations
 */
export interface WarContext {
  phase: number;
  isAttacker: boolean;
  opposeType?: {
    armType: number;
  };
  [key: string]: any;
}

/**
 * General context for turn execution
 */
export interface GeneralContext {
  turn: number;
  [key: string]: any;
}

/**
 * Domestic calculation auxiliary data
 */
export interface DomesticAux {
  armType?: number;
  [key: string]: any;
}

/**
 * Stat calculation auxiliary data
 */
export interface StatAux {
  isAttacker?: boolean;
  opposeType?: {
    armType: number;
  };
  [key: string]: any;
}

/**
 * Base special ability interface
 */
export interface BaseSpecial {
  /** Unique ID of the special ability */
  id: number;

  /** Name of the special ability */
  name: string;

  /** Description of the special ability */
  info: string;

  /** Get the name of the special ability */
  getName(): string;

  /** Get the description of the special ability */
  getInfo(): string;

  /** Get pre-turn execution triggers */
  getPreTurnExecuteTriggerList(general: General): GeneralTriggerCaller | null;

  /** Calculate domestic action modifiers */
  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: DomesticAux
  ): number;

  /** Calculate stat modifiers for the general */
  onCalcStat(
    general: General,
    statName: string,
    value: any,
    aux?: StatAux
  ): any;

  /** Calculate stat modifiers for the opponent */
  onCalcOpposeStat(
    general: General,
    statName: string,
    value: any,
    aux?: StatAux
  ): any;

  /** Calculate strategic command modifiers */
  onCalcStrategic(turnType: string, varType: string, value: any): any;

  /** Calculate national income modifiers */
  onCalcNationalIncome(type: string, amount: number): number;

  /** Get war power multipliers [attack, defense] */
  getWarPowerMultiplier(unit: WarUnit): [number, number];

  /** Get battle initialization triggers */
  getBattleInitSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null;

  /** Get battle phase triggers */
  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null;

  /** Handle arbitrary actions */
  onArbitraryAction(
    general: General,
    actionType: string,
    phase?: string | null,
    aux?: any
  ): any;
}

/**
 * War special ability static configuration
 */
export interface WarSpecialStaticConfig {
  selectWeightType: SpecialWeightType;
  selectWeight: number;
  type: SpecialType[];
}

/**
 * Domestic special ability static configuration
 */
export interface DomesticSpecialStaticConfig {
  selectWeightType: SpecialWeightType;
  selectWeight: number;
  type: SpecialType[];
}
