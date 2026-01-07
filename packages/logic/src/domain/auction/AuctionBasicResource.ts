import { BaseAuction } from "./BaseAuction.js";
import { General } from "../entities.js";
import { AuctionBid, AuctionInfo, ResourceType } from "./types.js";
import { JosaUtil } from "@sammo/common";

/**
 * 자원 경매 베이스 클래스 (쌀/금 거래)
 * 레거시 sammo/AuctionBasicResource.php 포팅
 */
export abstract class AuctionBasicResource extends BaseAuction {
  static readonly MIN_AUCTION_AMOUNT = 100;
  static readonly MAX_AUCTION_AMOUNT = 10000;

  static hostRes: ResourceType;
  static bidderRes: ResourceType;

  constructor(info: AuctionInfo, general: General) {
    super(info, general);
  }

  static validateOpenAuctionParams(
    amount: number,
    closeTurnCnt: number,
    startBidAmount: number,
    finishBidAmount: number
  ): string | null {
    if (closeTurnCnt < 1 || closeTurnCnt > 24) {
      return "종료기한은 1 ~ 24 턴 이어야 합니다.";
    }
    if (amount < this.MIN_AUCTION_AMOUNT || amount > this.MAX_AUCTION_AMOUNT) {
      return `거래량은 ${this.MIN_AUCTION_AMOUNT} ~ ${this.MAX_AUCTION_AMOUNT} 이어야 합니다.`;
    }
    if (startBidAmount < amount * 0.5 || amount * 2 < startBidAmount) {
      return "시작거래가는 50% ~ 200% 이어야 합니다.";
    }
    if (finishBidAmount < amount * 1.1 || amount * 2 < finishBidAmount) {
      return "즉시거래가는 110% ~ 200% 이어야 합니다.";
    }
    if (finishBidAmount < startBidAmount * 1.1) {
      return "즉시거래가는 시작판매가의 110% 이상이어야 합니다.";
    }
    return null;
  }

  bid(amount: number, tryExtendCloseDate: boolean): string | null {
    if (this.info.finished) {
      return "경매가 종료되었습니다.";
    }

    if (this.info.hostGeneralId === this.general.id) {
      return "자신이 연 경매에 입찰할 수 없습니다.";
    }

    const detail = this.info.detail;
    if (detail.startBidAmount !== null && amount < detail.startBidAmount) {
      return `최소 입찰가는 ${detail.startBidAmount}입니다.`;
    }

    const highestBid = this.getHighestBid();
    if (highestBid && amount <= highestBid.amount) {
      return `현재 최고 입찰가(${highestBid.amount})보다 높아야 합니다.`;
    }

    return null;
  }

  finishAuction(highestBid: AuctionBid, bidder: General): string | null {
    const auctionAmount = this.info.detail.amount;
    if (auctionAmount === null) {
      return "거래량이 설정되지 않았습니다.";
    }

    const bidAmount = highestBid.amount;
    const josaUlBidder = JosaUtil.pick(String(bidAmount), "을");
    const josaUlHost = JosaUtil.pick(String(auctionAmount), "을");

    return null;
  }

  rollbackAuction(): void {
    // 자원 경매 유찰 시 host에게 자원 반환 필요
    // 실제 반환은 서비스 레이어에서 처리
  }

  isInstantFinish(bidAmount: number): boolean {
    return (
      this.info.detail.finishBidAmount !== null && bidAmount >= this.info.detail.finishBidAmount
    );
  }
}
