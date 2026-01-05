export interface GeneralAccessLog {
  id?: number;
  generalID: number;
  userID: number | null;
  lastRefresh: Date;
  refresh: number;
  refreshTotal: number;
  refreshScore: number;
  refreshScoreTotal: number;
}
