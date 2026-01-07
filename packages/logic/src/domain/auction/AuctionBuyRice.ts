import { AuctionBasicResource } from "./AuctionBasicResource.js";
import { ResourceType } from "./types.js";

export class AuctionBuyRice extends AuctionBasicResource {
  static readonly auctionType = "BuyRice" as const;
  static readonly hostRes: ResourceType = "rice";
  static readonly bidderRes: ResourceType = "gold";
}
