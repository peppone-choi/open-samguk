import { General } from "../entities.js";
import { RandUtil, LiteHashDRBG } from "@sammo/common";
import { AuctionInfo, AuctionBid, AuctionType, AuctionResourceType } from "./types.js";

/**
 * 경매 시스템 베이스 클래스
 * 레거시 sammo/Auction.php 포팅
 */
export abstract class BaseAuction {
  protected info: AuctionInfo;

  // 상수 정의 (레거시 Auction.php lines 24-31)
  public static readonly COEFF_AUCTION_CLOSE_MINUTES = 24;
  public static readonly COEFF_EXTENSION_MINUTES_PER_BID = 1 / 6;
  public static readonly COEFF_EXTENSION_MINUTES_LIMIT_BY_BID = 0.5;
  public static readonly COEFF_EXTENSION_MINUTES_BY_EXTENSION_QUERY = 1;
  public static readonly MIN_AUCTION_CLOSE_MINUTES = 30;
  public static readonly MIN_EXTENSION_MINUTES_PER_BID = 1;
  public static readonly MIN_EXTENSION_MINUTES_LIMIT_BY_BID = 5;
  public static readonly MIN_EXTENSION_MINUTES_BY_EXTENSION_QUERY = 5;

  protected _highestBid: AuctionBid | null = null;

  constructor(
    info: AuctionInfo,
    protected general: General
  ) {
    this.info = info;
  }

  /**
   * 익명 이름 생성 (레거시 genObfuscatedName)
   */
  static genObfuscatedName(
    id: number,
    seed: string,
    namePoolRaw: {
      readonly first: readonly string[];
      readonly middle: readonly string[];
      readonly last: readonly string[];
    }
  ): string {
    // 레거시 로직: 3개 리스트(성, 이름1, 이름2) 조합 후 셔플
    const { first: firstNames, middle: middleNames, last: lastNames } = namePoolRaw;
    const pool: string[] = [];
    for (const f of firstNames) {
      for (const m of middleNames) {
        for (const l of lastNames) {
          pool.push(`${f}${m}${l}`);
        }
      }
    }

    const rng = new RandUtil(new LiteHashDRBG(`${seed}:obfuscatedNamePool`));
    const shuffledPool = rng.shuffle(pool);

    const dupIdx = Math.floor(id / shuffledPool.length);
    const subIdx = id % shuffledPool.length;

    if (dupIdx === 0) {
      return shuffledPool[subIdx];
    }
    return `${shuffledPool[subIdx]}${dupIdx}`;
  }

  public getInfo(): AuctionInfo {
    return this.info;
  }

  public getHighestBid(): AuctionBid | null {
    return this._highestBid;
  }

  /**
   * 최고 입찰자 설정 (Repository 등에서 호출)
   */
  public setHighestBid(bid: AuctionBid | null): void {
    this._highestBid = bid;
  }

  /**
   * 입찰 (추상 메서드)
   */
  abstract bid(amount: number, tryExtendCloseDate: boolean): string | null;

  /**
   * 유산 포인트 입찰 검증 (레거시 Auction.php bidInheritPoint lines 278-291)
   * 1% 이상 AND 10 포인트 이상 높게 입찰해야 함
   */
  protected validateInheritancePointBid(
    amount: number,
    highestBid: AuctionBid | null
  ): string | null {
    if (highestBid !== null) {
      // 1% 이상 높게 입찰해야 함
      if (amount < highestBid.amount * 1.01) {
        return "현재입찰가보다 1% 높게 입찰해야 합니다.";
      }
      // 10 포인트 이상 높게 입찰해야 함
      if (amount < highestBid.amount + 10) {
        return "현재입찰가보다 10 포인트 높게 입찰해야 합니다.";
      }
    }
    return null;
  }

  /**
   * 공통 입찰 로직
   * @param amount 입찰 금액
   * @param tryExtendCloseDate 종료 연장 시도 여부
   * @param now 현재 시간
   */
  protected _bid(amount: number, tryExtendCloseDate: boolean, now: Date): BidResult {
    if (this.info.finished) {
      return { success: false, error: "경매가 이미 끝났습니다." };
    }

    if (this.info.closeDate < now) {
      return { success: false, error: "경매가 이미 끝났습니다." };
    }

    if (this.info.openDate > now) {
      return { success: false, error: "경매가 아직 시작되지 않았습니다." };
    }

    const detail = this.info.detail;

    // 즉시판매가 체크
    if (!detail.isReverse) {
      if (detail.finishBidAmount !== null && amount > detail.finishBidAmount) {
        return { success: false, error: "즉시 낙찰가보다 높을 수 없습니다." };
      }
    } else {
      if (detail.finishBidAmount !== null && amount < detail.finishBidAmount) {
        return { success: false, error: "즉시 낙찰가보다 낮을 수 없습니다." };
      }
    }

    const highestBid = this.getHighestBid();

    // 이전 입찰가와 비교
    if (!detail.isReverse) {
      if (highestBid && amount <= highestBid.amount) {
        return { success: false, error: "현재 최고 입찰가보다 높아야 합니다." };
      }
      if (detail.startBidAmount !== null && amount < detail.startBidAmount) {
        return { success: false, error: "시작가보다 낮을 수 없습니다." };
      }
    } else {
      if (highestBid && amount >= highestBid.amount) {
        return { success: false, error: "현재 최고 입찰가보다 낮아야 합니다." };
      }
      if (detail.startBidAmount !== null && amount > detail.startBidAmount) {
        return { success: false, error: "시작가보다 높을 수 없습니다." };
      }
    }

    // 환불 대상 확인
    let refundInfo:
      | { generalId: number; amount: number; resource: AuctionResourceType }
      | undefined;
    if (highestBid && highestBid.generalId !== this.general.id) {
      refundInfo = {
        generalId: highestBid.generalId,
        amount: highestBid.amount,
        resource: this.info.reqResource,
      };
    }

    // 본인 추가 공제액 계산 (레거시: 이전 입찰이 있으면 차액만 공제하지만, 여기서는 전체 공제후 환불하는 방식 또는 차액만 처리)
    // 현재 구현은 매번 전체 금액을 지불하고 이전 입찰은 환불받는 것으로 단순화하거나,
    // 레거시처럼 차액만 처리할 수 있음. 여기서는 "새 입찰 = 새 자원 점유"로 보고 단순 처리.

    // 시간 연장 로직
    let newCloseDate: Date | undefined;
    const extensionThresholdMin = 5; // 5분 전 입찰 시 연장
    if (this.info.closeDate.getTime() - now.getTime() < extensionThresholdMin * 60 * 1000) {
      newCloseDate = new Date(this.info.closeDate.getTime() + extensionThresholdMin * 60 * 1000);

      // 최대 연장 제한 확인
      if (detail.availableLatestBidCloseDate && newCloseDate > detail.availableLatestBidCloseDate) {
        newCloseDate = detail.availableLatestBidCloseDate;
      }
    }

    return {
      success: true,
      deductGeneralId: this.general.id,
      deductAmount: amount,
      deductResource: this.info.reqResource,
      refund: refundInfo,
      newCloseDate,
    };
  }

  /**
   * 경매 완료 처리 (추상 메서드)
   */
  abstract finishAuction(highestBid: AuctionBid, bidder: General, relYear?: number): string | null;

  /**
   * 유찰/롤백 처리 (추상 메서드)
   */
  abstract rollbackAuction(): void;

  /**
   * 종료 시간 연장
   */
  public extendCloseDate(date: Date, force = false): string | null {
    if (!force) {
      if (this.info.detail.remainCloseDateExtensionCnt === null) {
        return "연장할 수 없는 경매입니다.";
      }
      if (this.info.detail.remainCloseDateExtensionCnt === 0) {
        return "더 이상 연장할 수 없습니다";
      }
      if (this.info.detail.remainCloseDateExtensionCnt > 0) {
        this.info.detail.remainCloseDateExtensionCnt--;
      }
    }

    if (date < this.info.closeDate) {
      return "종료 기간보다 짧습니다.";
    }

    this.info.closeDate = date;
    return null;
  }

  /**
   * 경매 종료 확인 및 처리
   */
  public tryFinish(now: Date): boolean | null {
    if (now < this.info.closeDate) {
      return null;
    }

    if (!this._highestBid) {
      this.closeAuction(true);
      return true;
    }

    // 연장 요청 처리
    if (this._highestBid.aux.tryExtendCloseDate) {
      // (현실적으로는 서비스 레이어에서 시간 상수를 주입받아 처리)
      // 레거시 로직 유사 구현 생략 (추후 보강)
    }

    return false; // 실제 종료 처리는 서비스에서 수행
  }

  public closeAuction(isRollback = false): void {
    this.info.finished = true;
    if (isRollback) {
      this.rollbackAuction();
    }
  }
}

export interface BidResult {
  success: boolean;
  error?: string;
  refund?: {
    generalId: number;
    amount: number;
    resource: AuctionResourceType;
  };
  deductGeneralId?: number;
  deductAmount?: number;
  deductResource?: AuctionResourceType;
  newCloseDate?: Date;
}
