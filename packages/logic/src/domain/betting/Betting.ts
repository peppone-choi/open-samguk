/**
 * 베팅 시스템 도메인 로직
 * 레거시 sammo/Betting.php 포팅
 */

import type {
  BettingInfo,
  BettingItem,
  BettingRewardItem,
  BetParams,
  BettingContext,
} from "./types.js";

export class Betting {
  private info: BettingInfo;

  constructor(info: BettingInfo) {
    this.info = info;
  }

  getInfo(): BettingInfo {
    return this.info;
  }

  /**
   * 베팅 키 변환 (배열 -> JSON 문자열)
   */
  private convertBettingKey(bettingType: number[]): string {
    return JSON.stringify(bettingType);
  }

  /**
   * 베팅 타입 정제 및 유효성 검사
   */
  purifyBettingKey(bettingType: number[], noValidate = false): number[] {
    const selectCnt = this.info.selectCnt;

    // 정렬 및 중복 제거
    const sorted = [...new Set(bettingType)].sort((a, b) => a - b);

    if (sorted.length !== selectCnt) {
      throw new Error("중복된 값이 있습니다.");
    }

    if (!noValidate) {
      for (const key of sorted) {
        if (key < 0 || key >= this.info.candidates.length) {
          throw new Error(`올바른 후보가 아닙니다: ${key}`);
        }
      }
    }

    return sorted;
  }

  /**
   * 베팅 가능 여부 확인
   */
  canBet(ctx: BettingContext): { ok: boolean; error?: string } {
    if (this.info.finished) {
      return { ok: false, error: "이미 종료된 베팅입니다" };
    }

    const yearMonth = ctx.year * 12 + ctx.month;

    if (this.info.closeYearMonth <= yearMonth) {
      return { ok: false, error: "이미 마감된 베팅입니다" };
    }

    if (this.info.openYearMonth > yearMonth) {
      return { ok: false, error: "아직 시작되지 않은 베팅입니다" };
    }

    return { ok: true };
  }

  /**
   * 베팅 생성 (유효성 검사 전용, 실제 DB 저장은 서비스 레이어에서)
   */
  validateBet(
    params: BetParams,
    ctx: BettingContext,
    prevBetAmount: number,
    currentResource: number
  ): { ok: boolean; error?: string; bettingTypeKey?: string } {
    const canBetResult = this.canBet(ctx);
    if (!canBetResult.ok) {
      return canBetResult;
    }

    if (params.bettingType.length !== this.info.selectCnt) {
      return { ok: false, error: "필요한 선택 수를 채우지 못했습니다." };
    }

    const resKey = this.info.reqInheritancePoint ? "유산포인트" : "금";
    const maxBet = 1000;

    if (prevBetAmount + params.amount > maxBet) {
      return {
        ok: false,
        error: `${maxBet - prevBetAmount}${resKey}까지만 베팅 가능합니다.`,
      };
    }

    if (this.info.reqInheritancePoint) {
      if (currentResource < params.amount) {
        return { ok: false, error: "유산포인트가 충분하지 않습니다." };
      }
    } else {
      if (currentResource < ctx.minGoldRequiredWhenBetting + params.amount) {
        return { ok: false, error: "금이 부족합니다." };
      }
    }

    try {
      const purified = this.purifyBettingKey(params.bettingType);
      const bettingTypeKey = this.convertBettingKey(purified);
      return { ok: true, bettingTypeKey };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  /**
   * 베팅 종료
   */
  closeBetting(year: number, month: number): void {
    this.info.closeYearMonth = year * 12 + month;
  }

  /**
   * 배타적 보상 계산 (1개만 선택 또는 isExclusive=true)
   */
  private calcRewardExclusive(
    winnerType: number[],
    bettingItems: BettingItem[]
  ): BettingRewardItem[] {
    const totalAmount = bettingItems.reduce((sum, item) => sum + item.amount, 0);

    if (totalAmount === 0) {
      return [];
    }

    const winnerKey = this.convertBettingKey(this.purifyBettingKey(winnerType, true));
    const winnerList = bettingItems.filter(
      (item) => item.bettingType === winnerKey && item.generalID > 0
    );

    const subAmount = winnerList.reduce((sum, item) => sum + item.amount, 0);

    if (subAmount === 0) {
      // 당첨자가 없으면 무효
      return [];
    }

    const multiplier = totalAmount / subAmount;
    const selectCnt = this.info.selectCnt;

    return winnerList.map((item) => ({
      generalID: item.generalID,
      userID: item.userID,
      amount: item.amount * multiplier,
      matchPoint: selectCnt,
    }));
  }

  /**
   * 복합 보상 계산 (부분 당첨 지원)
   */
  private calcRewardPartial(
    winnerType: number[],
    bettingItems: BettingItem[]
  ): BettingRewardItem[] {
    const selectCnt = this.info.selectCnt;
    const winnerTypeMap = new Set(winnerType);

    const calcMatchPoint = (bettingType: number[]): number => {
      return bettingType.filter((t) => winnerTypeMap.has(t)).length;
    };

    let totalAmount = 0;
    const subAmount: Record<number, number> = {};
    const subWinners: Record<number, BettingRewardItem[]> = {};

    for (let i = 0; i <= selectCnt; i++) {
      subAmount[i] = 0;
      subWinners[i] = [];
    }

    for (const item of bettingItems) {
      const bettingType = JSON.parse(item.bettingType) as number[];
      const matchPoint = calcMatchPoint(bettingType);
      totalAmount += item.amount;

      if (item.generalID === 0) {
        continue;
      }

      subAmount[matchPoint] += item.amount;
      subWinners[matchPoint].push({
        generalID: item.generalID,
        userID: item.userID,
        amount: item.amount,
        matchPoint,
      });
    }

    let remainRewardAmount = totalAmount;
    let accumulatedRewardAmount = 0;
    let givenRewardAmount = totalAmount;
    const rewardAmount: Record<number, number> = {};

    for (let matchPoint = selectCnt; matchPoint >= 0; matchPoint--) {
      givenRewardAmount /= 2;
      accumulatedRewardAmount += givenRewardAmount;

      if (subWinners[matchPoint].length === 0 || subAmount[matchPoint] === 0) {
        continue;
      }

      rewardAmount[matchPoint] = accumulatedRewardAmount;
      remainRewardAmount -= accumulatedRewardAmount;
      accumulatedRewardAmount = 0;
    }

    // 남은 상금은 최고 점수 당첨자에게
    if (Object.keys(rewardAmount).length > 0) {
      for (let matchPoint = selectCnt; matchPoint >= 0; matchPoint--) {
        if (rewardAmount[matchPoint] !== undefined) {
          rewardAmount[matchPoint] += remainRewardAmount;
          break;
        }
      }
    }

    const result: BettingRewardItem[] = [];

    for (let matchPoint = selectCnt; matchPoint >= 0; matchPoint--) {
      if (rewardAmount[matchPoint] === undefined || rewardAmount[matchPoint] === 0) {
        continue;
      }

      const subReward = rewardAmount[matchPoint];
      const multiplier = subReward / subAmount[matchPoint];

      for (const winner of subWinners[matchPoint]) {
        result.push({
          ...winner,
          amount: winner.amount * multiplier,
        });
      }
    }

    return result;
  }

  /**
   * 베팅 보상 계산
   */
  calcReward(winnerType: number[], bettingItems: BettingItem[]): BettingRewardItem[] {
    const selectCnt = this.info.selectCnt;

    if (selectCnt === 1 || this.info.isExclusive) {
      return this.calcRewardExclusive(winnerType, bettingItems);
    }

    return this.calcRewardPartial(winnerType, bettingItems);
  }

  /**
   * 베팅 완료 처리 (winner 설정)
   */
  finishBetting(winnerType: number[]): void {
    this.info.finished = true;
    this.info.winner = winnerType;
  }

  /**
   * 베팅 정보 직렬화
   */
  toArray(): BettingInfo {
    return { ...this.info };
  }

  /**
   * 베팅 ID 생성 (게임 환경에서 관리)
   */
  static genNextBettingID(lastBettingID: number): number {
    return lastBettingID + 1;
  }

  /**
   * 베팅 개설
   */
  static openBetting(params: {
    id: number;
    type: string;
    name: string;
    selectCnt: number;
    isExclusive: boolean;
    reqInheritancePoint: boolean;
    openYearMonth: number;
    closeYearMonth: number;
    candidates: { title: string; info: string | null; isHtml: boolean | null; aux: unknown }[];
  }): Betting {
    const info: BettingInfo = {
      id: params.id,
      type: params.type,
      name: params.name,
      finished: false,
      selectCnt: params.selectCnt,
      isExclusive: params.isExclusive,
      reqInheritancePoint: params.reqInheritancePoint,
      openYearMonth: params.openYearMonth,
      closeYearMonth: params.closeYearMonth,
      candidates: params.candidates.map((c) => ({
        title: c.title,
        info: c.info,
        isHtml: c.isHtml,
        aux: c.aux as Record<string, string | number | boolean | null | unknown[]> | null,
      })),
      winner: null,
    };

    return new Betting(info);
  }
}
