import { AuctionBasicResource } from "./AuctionBasicResource.js";
import { ResourceType } from "./types.js";

export class AuctionSellRice extends AuctionBasicResource {
  getHostRes(): ResourceType {
    return "gold";
  }
  getBidderRes(): ResourceType {
    return "rice";
  }
}
