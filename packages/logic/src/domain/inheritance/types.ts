/**
 * 유산 포인트 시스템 타입
 * 레거시 sammo/InheritancePointManager.php 포팅
 */

import { InheritanceKey } from "../enums/InheritanceKey.js";

/**
 * 유산 포인트 저장 타입
 * - true: 직접 저장형 (KVStorage에 직접 저장)
 * - false: 계산형 (게임 종료 시 계산)
 * - ['rank', RankColumn]: 랭킹 데이터에서 참조
 * - ['raw', fieldName]: 장수 필드에서 참조
 * - ['aux', fieldName]: 장수 aux에서 참조
 */
export type InheritanceStoreType = boolean | ["rank", string] | ["raw", string] | ["aux", string];

/**
 * 유산 포인트 타입 정의
 */
export interface InheritancePointTypeConfig {
  /** 저장 방식 */
  storeType: InheritanceStoreType;
  /** 포인트 계수 (곱해서 최종 포인트 산출) */
  pointCoeff: number;
  /** 설명 텍스트 */
  info: string;
  /** 환생 시 적용 계수 (null이면 환생 시 유지) */
  rebirthStoreCoeff: number | null;
}

/**
 * 유산 포인트 값 저장 형태
 * [value, aux] 형태로 저장
 */
export type InheritancePointValue = [number, unknown];

/**
 * 유산 포인트 계산 컨텍스트
 */
export interface InheritanceContext {
  /** 게임 통일 여부 */
  isUnited: boolean;
  /** 현재 연도 */
  year: number;
  /** 시작 연도 */
  startYear: number;
  /** 현재 월 */
  month: number;
}

/**
 * 장수 유산 포인트 계산용 데이터
 */
export interface GeneralInheritanceData {
  id: number;
  ownerID: number | null;
  npc: number;
  belong: number;
  /** 각 병종별 숙련도 */
  dexValues: Record<string, number>;
  /** 랭킹 데이터 */
  rankData: Record<string, number>;
  /** aux 데이터 */
  aux: Record<string, unknown>;
  /** 픽 년월 (NPC용) */
  pickYearMonth?: number;
}

/**
 * 유산 포인트 결과
 */
export interface InheritanceResult {
  serverID: string;
  ownerID: number;
  generalID: number;
  year: number;
  month: number;
  value: Record<string, InheritancePointValue>;
}

/**
 * 유산 포인트 적용 결과
 */
export interface InheritanceApplyResult {
  ownerID: number;
  previousPoint: number;
  totalPoint: number;
  pointChanges: Array<{
    key: InheritanceKey;
    info: string;
    value: number;
  }>;
}

/**
 * 숙련도 레벨 리스트 (레거시 getDexLevelList() 대응)
 */
export const DEX_LEVEL_LIST: Array<[number, string]> = [
  [0, "E"],
  [500, "D"],
  [3000, "C"],
  [10000, "B"],
  [30000, "A"],
  [100000, "S"],
];

/**
 * 숙련도 상한값
 */
export const DEX_LIMIT = DEX_LEVEL_LIST[DEX_LEVEL_LIST.length - 1][0];

/**
 * 병종 타입 목록 (레거시 GameUnitConst::allType() 대응)
 */
export const ARM_TYPES = ["footman", "archer", "cavalry", "chariot", "elephant", "navy"] as const;

export type ArmType = (typeof ARM_TYPES)[number];
