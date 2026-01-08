import type { General } from "../entities";
import type { RandUtil } from "@sammo/common";
import type { UnitData } from "../scenario/schema.js";

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
  unitData?: UnitData;
  oppose?: WarUnit | WarUnitCity;
  battleLog: WarBattleLogEntry[];

  /** 인스턴스별 RNG */
  rng: RandUtil;
  /** 공격측 여부 */
  isAttacker: boolean;
  /** 현재 전투 페이즈 */
  phase: number;
  /** 전투력 배수 */
  warPowerMultiplier: number;
  /** 활성화된 스킬 목록 */
  activatedSkills: Set<string>;

  getGeneral(): General;
  getOppose(): WarUnit | WarUnitCity | undefined;
  hasActivatedSkillOnLog(skillName: string): number;

  /** HP(병력) 관리 */
  getCrew(): number;
  decreaseHP(damage: number): number;
  increaseKilled(damage: number): void;
  canContinue(): { canContinue: boolean; noRice: boolean };

  /** 스탯 조회 */
  getAttack(): number;
  getDefense(): number;
  getSpeed(): number;

  /** 스킬 활성화 */
  activateSkill(skill: string): void;
  /** 스킬 비활성화 */
  deactivateSkill(skill: string): void;
  /** 스킬 활성화 여부 확인 */
  hasActivatedSkill(skill: string): boolean;
  /** 전투력 배수 적용 */
  multiplyWarPower(multiplier: number): void;

  /** 결과 조회 */
  getKilled(): number;
  getDead(): number;
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
 * 트리거 발동 유형
 * 레거시 BaseWarUnitTrigger.php의 TYPE_* 상수 참조
 */
export const RaiseType = {
  NONE: 0,
  ITEM: 1,
  CONSUMABLE_ITEM: 3, // 1 | 2
  SPECIAL: 4,
  UNIT: 8,
} as const;

export type RaiseTypeValue = (typeof RaiseType)[keyof typeof RaiseType];

/**
 * 전투 트리거 컨텍스트
 * 레거시 BaseWarUnitTrigger.php의 actionWar 매개변수 참조
 */
export interface WarUnitTriggerContext {
  /** 트리거 소유 유닛 (자신) */
  self: WarUnit;
  /** 상대 유닛 */
  oppose: WarUnit | WarUnitCity;
  /** RNG 인스턴스 */
  rand: RandUtil;
  /** 자신측 환경 변수 (트리거 간 상태 공유) */
  selfEnv: Record<string, unknown>;
  /** 상대측 환경 변수 */
  opposeEnv: Record<string, unknown>;
  /** 현재 전투 페이즈 */
  phase: number;
  /** 공격측 여부 */
  isAttacker: boolean;
}

/**
 * 전투 트리거 실행 결과
 */
export interface WarUnitTriggerResult {
  /** 상태 변경 델타 */
  delta: import("../entities").WorldDelta;
  /** false면 다음 트리거 실행 중단 (cascade control) */
  continueExecution: boolean;
}

/**
 * 우선순위 기반 전투 트리거 인터페이스
 */
export interface WarUnitTrigger {
  readonly name: string;
  readonly priority: number;
  readonly raiseType: RaiseTypeValue;
  readonly unit: WarUnit;

  /**
   * 트리거 실행 가능 여부 판정
   */
  attempt(ctx: WarUnitTriggerContext): boolean;

  /**
   * 트리거 실행
   */
  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult;
}

/**
 * 전투 트리거 호출자
 */
export class WarUnitTriggerCaller {
  private triggers: WarUnitTrigger[];

  constructor(...triggers: WarUnitTrigger[]) {
    this.triggers = triggers;
  }

  getTriggers(): WarUnitTrigger[] {
    return this.triggers;
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
  onCalcDomestic(turnType: string, varType: string, value: number, aux?: DomesticAux): number;

  /** Calculate stat modifiers for the general */
  onCalcStat(general: General, statName: string, value: any, aux?: StatAux): any;

  /** Calculate stat modifiers for the opponent */
  onCalcOpposeStat(general: General, statName: string, value: any, aux?: StatAux): any;

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
  onArbitraryAction(general: General, actionType: string, phase?: string | null, aux?: any): any;
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
