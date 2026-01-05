import type { AuctionType } from '../enums/AuctionType';
import type { ResourceType } from '../enums/ResourceType';
import type { AuctionInfoDetail } from './AuctionInfoDetail';

export interface AuctionInfo {
  id?: number;
  type: AuctionType;
  finished: boolean;
  target: string | null;
  hostGeneralID: number;
  reqResource: ResourceType;
  openDate: Date;
  closeDate: Date;
  detail: AuctionInfoDetail;
}
