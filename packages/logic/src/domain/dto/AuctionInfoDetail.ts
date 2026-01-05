export interface AuctionInfoDetail {
  title: string;
  hostName: string;
  amount: number;
  isReverse?: boolean;
  startBidAmount: number;
  finishBidAmount?: number;
  remainCloseDateExtensionCnt?: number;
  availableLatestBidCloseDate?: Date;
}
