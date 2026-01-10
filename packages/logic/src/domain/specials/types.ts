import type { General } from "../entities";
import type { RandUtil } from "@sammo/common";
import type { UnitData } from "../scenario/schema.js";

/**
 * 특수 능력 선택 확률을 위한 가중치 유형
 */
export enum SpecialWeightType {
  NORM = 1, // 일반 가중치 기반 선택
  PERCENT = 2, // 백분율 기반 선택
}

/**
 * 스탯 기반 조건을 위한 특수 능력 유형 플래그
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
 * 전투 계산용 전쟁 유닛
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
 * 전투 계산용 도시 유닛
 */
export interface WarUnitCity {
  def: number;
  wall: number;
  trust: number;
}

/**
 * 유닛이 WarUnit인지 확인하는 타입 가드 (WarUnitCity가 아님)
 */
export function isWarUnit(unit: WarUnit | WarUnitCity): unit is WarUnit {
  return "general" in unit;
}

/**
 * 전투 로그 항목
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
 * 턴 실행 전 장수 트리거
 */
export interface GeneralTrigger {
  general: General;
  process(context: GeneralContext): void;
}

/**
 * 여러 트리거를 관리하는 장수 트리거 호출자
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
 * 전투 계산용 전쟁 컨텍스트
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
 * 턴 실행용 장수 컨텍스트
 */
export interface GeneralContext {
  turn: number;
  [key: string]: any;
}

/**
 * 내정 계산 보조 데이터
 */
export interface DomesticAux {
  armType?: number;
  [key: string]: any;
}

/**
 * 스탯 계산 보조 데이터
 */
export interface StatAux {
  isAttacker?: boolean;
  opposeType?: {
    armType: number;
  };
  [key: string]: any;
}

/**
 * 기본 특수 능력 인터페이스
 */
export interface BaseSpecial {
  /** 특수 능력의 고유 ID */
  id: number;

  /** 특수 능력의 이름 */
  name: string;

  /** 특수 능력의 설명 */
  info: string;

  /** 특수 능력의 이름 조회 */
  getName(): string;

  /** 특수 능력의 설명 조회 */
  getInfo(): string;

  /** 턴 실행 전 트리거 목록 조회 */
  getPreTurnExecuteTriggerList(general: General): GeneralTriggerCaller | null;

  /** 내정 행동 보정값 계산 */
  onCalcDomestic(turnType: string, varType: string, value: number, aux?: DomesticAux): number;

  /** 장수의 스탯 보정값 계산 */
  onCalcStat(general: General, statName: string, value: any, aux?: StatAux): any;

  /** 상대의 스탯 보정값 계산 */
  onCalcOpposeStat(general: General, statName: string, value: any, aux?: StatAux): any;

  /** 전략 명령 보정값 계산 */
  onCalcStrategic(turnType: string, varType: string, value: any): any;

  /** 국가 수입 보정값 계산 */
  onCalcNationalIncome(type: string, amount: number): number;

  /** 전투력 배수 조회 [공격, 방어] */
  getWarPowerMultiplier(unit: WarUnit): [number, number];

  /** 전투 초기화 트리거 목록 조회 */
  getBattleInitSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null;

  /** 전투 페이즈 트리거 목록 조회 */
  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null;

  /** 임의 행동 처리 */
  onArbitraryAction(general: General, actionType: string, phase?: string | null, aux?: any): any;
}

/**
 * 전투 특수 능력 정적 설정
 */
export interface WarSpecialStaticConfig {
  selectWeightType: SpecialWeightType;
  selectWeight: number;
  type: SpecialType[];
}

/**
 * 내정 특수 능력 정적 설정
 */
export interface DomesticSpecialStaticConfig {
  selectWeightType: SpecialWeightType;
  selectWeight: number;
  type: SpecialType[];
}
