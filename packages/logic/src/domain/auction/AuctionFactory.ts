import { AuctionInfo, AuctionType } from "./types.js";
import { General } from "../entities.js";
import { BaseAuction } from "./BaseAuction.js";
import { AuctionUniqueItem } from "./AuctionUniqueItem.js";
import { AuctionBuyRice } from "./AuctionBuyRice.js";
import { AuctionSellRice } from "./AuctionSellRice.js";

/**
 * 경매 개체 생성 팩토리
 */
export class AuctionFactory {
  /**
   * 경매 타입에 맞는 클래스 인스턴스 생성
   */
  static create(info: AuctionInfo, general: General): BaseAuction {
    switch (info.type) {
      case "UniqueItem":
        return new AuctionUniqueItem(info, general);
      case "BuyRice":
        return new AuctionBuyRice(info, general);
      case "SellRice":
        return new AuctionSellRice(info, general);
      default:
        throw new Error(`지원하지 않는 경매 타입입니다: ${info.type}`);
    }
  }
}
