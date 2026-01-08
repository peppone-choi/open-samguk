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

  constructor(info: AuctionInfo, general: General) {
    super(info, general);
  }

  abstract getHostRes(): ResourceType;
  abstract getBidderRes(): ResourceType;

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
    const res = this._bid(amount, tryExtendCloseDate, new Date());
    if (!res.success) {
      return res.error ?? "입찰 실패";
    }

    return null;
  }

  finishAuction(highestBid: AuctionBid, bidder: General): string | null {
    const auctionAmount = this.info.detail.amount;
    if (auctionAmount === null) {
      return "거래량이 설정되지 않았습니다.";
    }

    const bidAmount = highestBid.amount;
    const hostRes = this.getHostRes();
    const bidderRes = this.getBidderRes();

    // 자원 이동 (사후 처리는 서비스 레이어에서 반영)
    // 낙찰자(bidder)는 hostRes를 받고, bidderRes를 지불함.
    // host는 bidderRes를 받음. (hostRes는 개설 시 이미 지불됨)
    bidder[hostRes] += auctionAmount;

    // bidderRes 지불은 서비스 레이어의 _bid() 또는 낙찰 시점에서 이미 처리되었을 수도 있음.
    // 레거시 AuctionBasicResource.php:192-193 참고
    // $auctionHost->increaseVar($bidderRes->value, $bidAmount);
    // $bidder->increaseVar($hostRes->value, $auctionAmount);

    return null;
  }

  rollbackAuction(): void {
    // 자원 경매 유찰 시 host에게 자원 반환 필요
    // 실제 반환은 서비스 레이어에서 처리 (hostGeneralId 필요)
  }

  isInstantFinish(bidAmount: number): boolean {
    return (
      this.info.detail.finishBidAmount !== null && bidAmount >= this.info.detail.finishBidAmount
    );
  }
}
