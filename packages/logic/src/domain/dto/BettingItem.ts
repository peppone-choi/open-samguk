export interface BettingItem {
  rowID?: number;
  bettingID: number;
  generalID: number;
  userID: number | null;
  bettingType: string;
  amount: number;
}
