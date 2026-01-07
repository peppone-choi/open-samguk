import { General } from "../entities.js";
import { RandUtil, LiteHashDRBG } from "@sammo/common";
import { AuctionInfo, AuctionBid, AuctionType, AuctionResourceType } from "./types.js";

/**
 * 경매 시스템 베이스 클래스
 * 레거시 sammo/Auction.php 포팅
 */
export abstract class BaseAuction {
  protected info: AuctionInfo;

  // 상수 정의
  public static readonly MIN_AUCTION_CLOSE_MINUTES = 30;
  public static readonly MIN_EXTENSION_MINUTES_PER_BID = 1;

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
  static genObfuscatedName(id: number, seed: string, namePoolRaw: string[][]): string {
    // 레거시 로직: 3개 리스트(성, 이름1, 이름2) 조합 후 셔플
    const [firstNames, middleNames, lastNames] = namePoolRaw;
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
   * 경매 완료 처리 (추상 메서드)
   */
  abstract finishAuction(highestBid: AuctionBid, bidder: General): string | null;

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
