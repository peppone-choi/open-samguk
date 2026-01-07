import type { GeneralReadOnly, WarUnitReadOnly } from "../types.js";

/**
 * 트리거 타입 구분
 */
export const TriggerType = {
  /** 아이템 트리거 기본값 */
  TYPE_ITEM: 1,
  /** 특기 트리거 기본값 */
  TYPE_SPECIAL: 2,
  /** 트리거 중복 방지 베이스 */
  TYPE_DEDUP_TYPE_BASE: 1000,
} as const;

/**
 * 장수 트리거 종류
 */
export type GeneralTriggerType =
  | "che_도시치료" // 턴 실행 전 도시 장수 치료
  | "che_아이템치료" // 소모품 아이템 치료
  | "che_부상경감" // 전투 후 부상 경감
  | "che_병력군량소모"; // 병력/군량 소모 계산

/**
 * 전투 트리거 종류
 */
export type WarUnitTriggerType =
  | "che_필살시도" // 필살 확률 체크
  | "che_필살발동" // 필살 성공 시 효과
  | "che_회피시도" // 회피 확률 체크
  | "che_회피발동" // 회피 성공 시 효과
  | "che_격노시도" // 격노 발동 체크
  | "che_격노발동" // 격노 성공 시 효과
  | "che_저격시도" // 저격 확률 체크
  | "che_저격발동" // 저격 성공 시 효과
  | "che_계략시도" // 계략 시도 체크
  | "che_계략발동" // 계략 성공 시 효과
  | "che_반계시도" // 반계 확률 체크
  | "che_반계발동" // 반계 성공 시 효과
  | "che_위압시도" // 위압 확률 체크
  | "che_위압발동" // 위압 성공 시 효과
  | "che_전투치료시도" // 전투 중 치료 확률 체크
  | "che_전투치료발동" // 전투 중 치료 성공 시 효과
  | "che_돌격지속" // 돌격 지속 효과
  | "che_선제사격시도" // 궁병 선제 사격 체크
  | "che_선제사격발동"; // 궁병 선제 사격 성공 시 효과

/**
 * 트리거 결과
 */
export interface TriggerResult {
  /** 트리거 발동 여부 */
  triggered: boolean;
  /** 결과 메시지 */
  message?: string;
  /** 추가 데이터 */
  data?: Record<string, unknown>;
}

/**
 * 장수 트리거 컨텍스트
 */
export interface GeneralTriggerContext {
  /** 장수 정보 */
  general: GeneralReadOnly;
  /** 랜덤 유틸리티 */
  rng: { nextFloat(): number };
  /** 추가 데이터 */
  aux?: Record<string, unknown>;
}

/**
 * 전투 트리거 컨텍스트
 */
export interface WarUnitTriggerContext {
  /** 전투 유닛 정보 */
  unit: WarUnitReadOnly;
  /** 상대 전투 유닛 정보 */
  opponent?: WarUnitReadOnly;
  /** 랜덤 유틸리티 */
  rng: { nextFloat(): number };
  /** 현재 페이즈 */
  phase: number;
  /** 추가 데이터 */
  aux?: Record<string, unknown>;
}

/**
 * 장수 트리거 인터페이스
 */
export interface IGeneralTrigger {
  /** 트리거 종류 */
  readonly triggerType: GeneralTriggerType;
  /** 트리거 ID (중복 방지용) */
  readonly triggerId: number;
  /** 트리거 실행 */
  execute(context: GeneralTriggerContext): TriggerResult;
}

/**
 * 전투 트리거 인터페이스
 */
export interface IWarUnitTrigger {
  /** 트리거 종류 */
  readonly triggerType: WarUnitTriggerType;
  /** 트리거 ID (중복 방지용) */
  readonly triggerId: number;
  /** 트리거 실행 */
  execute(context: WarUnitTriggerContext): TriggerResult;
}

/**
 * 트리거 호출자 (여러 트리거를 묶어서 호출)
 */
export interface TriggerCaller<T extends { execute: (context: any) => TriggerResult }> {
  readonly triggers: T[];
  executeAll(context: Parameters<T["execute"]>[0]): TriggerResult[];
}
