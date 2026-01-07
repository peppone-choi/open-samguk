import { AuctionBasicResource } from "./AuctionBasicResource.js";
import { ResourceType } from "./types.js";

export class AuctionSellRice extends AuctionBasicResource {
  static readonly auctionType = "SellRice" as const;
  static readonly hostRes: ResourceType = "gold";
  static readonly bidderRes: ResourceType = "rice";
}
