import { AuctionBasicResource } from "./AuctionBasicResource.js";
import { ResourceType } from "./types.js";

export class AuctionBuyRice extends AuctionBasicResource {
  getHostRes(): ResourceType {
    return "rice";
  }
  getBidderRes(): ResourceType {
    return "gold";
  }
}
