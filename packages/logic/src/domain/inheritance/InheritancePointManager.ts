/**
 * 유산 포인트 관리자
 * 레거시 sammo/InheritancePointManager.php 포팅
 */

import { InheritanceKey } from "../enums/InheritanceKey.js";
import type {
  InheritancePointTypeConfig,
  InheritanceStoreType,
  InheritancePointValue,
  InheritanceContext,
  GeneralInheritanceData,
  InheritanceApplyResult,
  DEX_LIMIT,
  ARM_TYPES,
} from "./types.js";

/**
 * 유산 포인트 타입 정의 맵
 * 레거시: InheritancePointManager::$inheritanceKey
 */
export const INHERITANCE_POINT_TYPES: Map<InheritanceKey, InheritancePointTypeConfig> = new Map([
  [
    InheritanceKey.previous,
    { storeType: true, pointCoeff: 1, info: "기존 보유", rebirthStoreCoeff: 1 },
  ],
  [
    InheritanceKey.lived_month,
    { storeType: true, pointCoeff: 1, info: "생존", rebirthStoreCoeff: 1 },
  ],
  [
    InheritanceKey.max_belong,
    { storeType: false, pointCoeff: 10, info: "최대 임관년 수", rebirthStoreCoeff: null },
  ],
  [
    InheritanceKey.max_domestic_critical,
    { storeType: true, pointCoeff: 1, info: "최대 연속 내정 성공", rebirthStoreCoeff: null },
  ],
  [
    InheritanceKey.active_action,
    { storeType: true, pointCoeff: 3, info: "능동 행동 수", rebirthStoreCoeff: 1 },
  ],
  [
    InheritanceKey.combat,
    { storeType: ["rank", "warnum"], pointCoeff: 5, info: "전투 횟수", rebirthStoreCoeff: 1 },
  ],
  [
    InheritanceKey.sabotage,
    {
      storeType: ["rank", "firenum"],
      pointCoeff: 20,
      info: "계략 성공 횟수",
      rebirthStoreCoeff: 1,
    },
  ],
  [
    InheritanceKey.unifier,
    { storeType: true, pointCoeff: 1, info: "천통 기여", rebirthStoreCoeff: null },
  ],
  [
    InheritanceKey.dex,
    { storeType: false, pointCoeff: 0.001, info: "숙련도", rebirthStoreCoeff: 0.5 },
  ],
  [
    InheritanceKey.tournament,
    { storeType: true, pointCoeff: 1, info: "토너먼트", rebirthStoreCoeff: 1 },
  ],
  [
    InheritanceKey.betting,
    { storeType: false, pointCoeff: 10, info: "베팅 당첨", rebirthStoreCoeff: 1 },
  ],
]);

/**
 * 유산 포인트 관리자 (싱글톤)
 */
export class InheritancePointManager {
  private static instance: InheritancePointManager | null = null;

  private constructor() {}

  static getInstance(): InheritancePointManager {
    if (!InheritancePointManager.instance) {
      InheritancePointManager.instance = new InheritancePointManager();
    }
    return InheritancePointManager.instance;
  }

  /**
   * 유산 포인트 타입 조회
   */
  getInheritancePointType(key: InheritanceKey): InheritancePointTypeConfig {
    const config = INHERITANCE_POINT_TYPES.get(key);
    if (!config) {
      throw new Error(`${key}는 유산 타입이 아님`);
    }
    return config;
  }

  /**
   * 직접 저장형 유산인지 확인
   */
  isDirectStoreType(key: InheritanceKey): boolean {
    const config = this.getInheritancePointType(key);
    return config.storeType === true;
  }

  /**
   * 유산 포인트 계산 (단일 장수)
   * 레거시: getInheritancePoint()
   */
  getInheritancePoint(
    general: GeneralInheritanceData,
    key: InheritanceKey,
    storedValues: Map<string, InheritancePointValue>,
    ctx: InheritanceContext,
    forceCalc = false
  ): { value: number; aux: unknown } {
    const config = this.getInheritancePointType(key);

    // NPC는 포인트 없음
    if (!general.ownerID) {
      return { value: 0, aux: null };
    }

    if (general.npc >= 2) {
      return { value: 0, aux: null };
    }

    const { storeType, pointCoeff } = config;

    // 통일 상태이거나 직접 저장형이면 저장된 값 반환
    if (storeType === true || (ctx.isUnited && !forceCalc)) {
      const stored = storedValues.get(key);
      if (stored) {
        return { value: stored[0], aux: stored[1] };
      }
      return { value: 0, aux: null };
    }

    // 통일 상태에서 previous가 아니면 0
    if (ctx.isUnited && key !== InheritanceKey.previous) {
      return { value: 0, aux: null };
    }

    // 참조형 처리
    if (Array.isArray(storeType)) {
      const [subType, subKey] = storeType;

      if (subType === "rank") {
        const rankValue = general.rankData[subKey] ?? 0;
        return { value: rankValue * pointCoeff, aux: null };
      }

      if (subType === "raw") {
        const rawValue = (general as unknown as Record<string, number>)[subKey] ?? 0;
        return { value: rawValue * pointCoeff, aux: null };
      }

      if (subType === "aux") {
        const auxValue = (general.aux[subKey] as number) ?? 0;
        return { value: auxValue * pointCoeff, aux: null };
      }

      throw new Error(`${subType}은 참조할 수 없는 유산 세부키임`);
    }

    if (storeType !== false) {
      throw new Error(`${storeType}은 올바르지 않은 유산 키임`);
    }

    // 계산형 처리
    return this.extractInheritanceValue(general, key, pointCoeff);
  }

  /**
   * 계산형 유산 포인트 추출
   */
  private extractInheritanceValue(
    general: GeneralInheritanceData,
    key: InheritanceKey,
    multiplier: number
  ): { value: number; aux: unknown } {
    switch (key) {
      case InheritanceKey.dex:
        return this.extractDexPoint(general, multiplier);

      case InheritanceKey.betting:
        return this.extractBettingPoint(general, multiplier);

      case InheritanceKey.max_belong:
        return this.extractMaxBelongPoint(general, multiplier);

      default:
        throw new Error(`${key}는 유산 추출기를 보유하고 있지 않음`);
    }
  }

  /**
   * 숙련도 포인트 계산
   * 레거시: extractFn for dex
   */
  private extractDexPoint(
    general: GeneralInheritanceData,
    multiplier: number
  ): { value: number; aux: unknown } {
    const dexLimit = 100000; // DEX_LIMIT from types

    let totalDex = 0;
    const armTypes = ["footman", "archer", "cavalry", "chariot", "elephant", "navy"];

    for (const armType of armTypes) {
      let subDex = general.dexValues[armType] ?? 0;

      // 상한 초과분은 1/3만 계산
      if (subDex > dexLimit) {
        totalDex += (subDex - dexLimit) / 3;
        subDex = dexLimit;
      }
      totalDex += subDex;
    }

    return { value: totalDex * multiplier, aux: null };
  }

  /**
   * 베팅 포인트 계산
   * 레거시: extractFn for betting
   */
  private extractBettingPoint(
    general: GeneralInheritanceData,
    multiplier: number
  ): { value: number; aux: unknown } {
    const betWin = general.rankData["betwin"] ?? 0;
    const betWinGold = general.rankData["betwingold"] ?? 0;
    const betGold = general.rankData["betgold"] ?? 0;

    const betWinRate = betWinGold / Math.max(1000, betGold);

    return { value: betWin * multiplier * Math.pow(betWinRate, 2), aux: null };
  }

  /**
   * 최대 임관년수 포인트 계산
   * 레거시: extractFn for max_belong
   */
  private extractMaxBelongPoint(
    general: GeneralInheritanceData,
    multiplier: number
  ): { value: number; aux: unknown } {
    const maxBelong = Math.max(
      general.belong,
      (general.aux[InheritanceKey.max_belong] as number) ?? 0
    );
    return { value: maxBelong * multiplier, aux: null };
  }

  /**
   * 유산 포인트 설정 (직접 저장형만)
   * 레거시: setInheritancePoint()
   */
  validateSetInheritancePoint(key: InheritanceKey, value: number): { ok: boolean; error?: string } {
    if (typeof value !== "number") {
      return { ok: false, error: `${value}는 숫자가 아님` };
    }

    const config = this.getInheritancePointType(key);

    if (config.storeType !== true) {
      return { ok: false, error: `${key}는 직접 저장형 유산 포인트가 아님` };
    }

    if (config.pointCoeff !== 1 && value !== 0) {
      return { ok: false, error: `${key}는 1:1 유산 포인트가 아님` };
    }

    return { ok: true };
  }

  /**
   * 유산 포인트 증가량 계산
   * 레거시: increaseInheritancePoint()
   */
  calculateIncreaseAmount(key: InheritanceKey, value: number): number {
    const config = this.getInheritancePointType(key);

    if (config.storeType !== true) {
      throw new Error(`${key}는 직접 저장형 유산 포인트가 아님`);
    }

    return value * config.pointCoeff;
  }

  /**
   * 유산 포인트 적용 (게임 종료 시)
   * 레거시: applyInheritanceUser()
   */
  applyInheritancePoints(
    ownerID: number,
    allPoints: Map<string, InheritancePointValue>,
    isRebirth = false
  ): InheritanceApplyResult {
    if (ownerID === 0) {
      return {
        ownerID,
        previousPoint: 0,
        totalPoint: 0,
        pointChanges: [],
      };
    }

    // 비어있으면 리셋 안함
    if (allPoints.size === 0) {
      return {
        ownerID,
        previousPoint: 0,
        totalPoint: 0,
        pointChanges: [],
      };
    }

    // 이미 리셋된 상태 (previous만 있음)
    if (allPoints.size === 1 && allPoints.has(InheritanceKey.previous)) {
      const previousValue = allPoints.get(InheritanceKey.previous);
      const previousPoint = previousValue ? previousValue[0] : 0;
      return {
        ownerID,
        previousPoint,
        totalPoint: previousPoint,
        pointChanges: [],
      };
    }

    const previousPointValue = allPoints.get(InheritanceKey.previous);
    const previousPoint = previousPointValue ? previousPointValue[0] : 0;

    let totalPoint = 0;
    const pointChanges: InheritanceApplyResult["pointChanges"] = [];
    const keepValues: Map<string, InheritancePointValue> = new Map();

    for (const [rKey, pointValue] of allPoints) {
      const key = rKey as InheritanceKey;
      let [value, auxV] = pointValue;

      const config = INHERITANCE_POINT_TYPES.get(key);
      if (!config) continue;

      if (isRebirth) {
        if (config.rebirthStoreCoeff === null) {
          keepValues.set(rKey, [value, auxV]);
          continue;
        }

        value *= config.rebirthStoreCoeff;
      }

      pointChanges.push({
        key,
        info: config.info,
        value,
      });

      totalPoint += value;
    }

    totalPoint = Math.floor(totalPoint);

    return {
      ownerID,
      previousPoint,
      totalPoint,
      pointChanges,
    };
  }

  /**
   * NPC 유산 포인트 병합 가능 여부 확인
   * 레거시: mergeTotalInheritancePoint()의 NPC 검증 부분
   */
  canMergeNPCInheritance(
    general: GeneralInheritanceData,
    ctx: InheritanceContext,
    isRebirth: boolean
  ): boolean {
    if (general.npc !== 1) {
      return true;
    }

    if (isRebirth) {
      return false;
    }

    const pickYearMonth = general.pickYearMonth;
    if (pickYearMonth === undefined) {
      return false;
    }

    const pickYear = Math.floor(pickYearMonth / 12);
    const elapsedYears = ctx.year - pickYear;
    const gameYears = ctx.year - ctx.startYear;

    // 게임 진행의 절반 이상 참여해야 함
    return elapsedYears * 2 > gameYears;
  }

  /**
   * 유산 포인트 리셋 필요 여부 확인
   * 레거시: clearInheritancePoint()의 조건 검사
   */
  needsClearance(allPoints: Map<string, InheritancePointValue>): boolean {
    if (allPoints.size === 0) {
      return false;
    }

    if (allPoints.size === 1 && allPoints.has(InheritanceKey.previous)) {
      return false;
    }

    return true;
  }

  /**
   * 모든 유산 키 목록 반환
   */
  getAllKeys(): InheritanceKey[] {
    return Array.from(INHERITANCE_POINT_TYPES.keys());
  }

  /**
   * 직접 저장형 유산 키 목록 반환
   */
  getDirectStoreKeys(): InheritanceKey[] {
    return Array.from(INHERITANCE_POINT_TYPES.entries())
      .filter(([, config]) => config.storeType === true)
      .map(([key]) => key);
  }

  /**
   * 계산형 유산 키 목록 반환
   */
  getCalculatedKeys(): InheritanceKey[] {
    return Array.from(INHERITANCE_POINT_TYPES.entries())
      .filter(([, config]) => config.storeType !== true)
      .map(([key]) => key);
  }
}

export const inheritancePointManager = InheritancePointManager.getInstance();
