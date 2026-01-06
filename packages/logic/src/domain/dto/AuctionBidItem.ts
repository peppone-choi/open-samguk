import type { AuctionBidItemData } from "./AuctionBidItemData";

export interface AuctionBidItem {
  no?: number;
  auctionID: number;
  owner: number | null;
  generalID: number;
  amount: number;
  date: Date;
  aux: AuctionBidItemData;
}
