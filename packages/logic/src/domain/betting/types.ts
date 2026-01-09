import type { BettingInfo, BettingItem, SelectItem } from "../dto/index.js";

export type { BettingInfo, BettingItem, SelectItem };

export interface BettingRewardItem {
  generalID: number;
  userID: number | null;
  amount: number;
  matchPoint: number;
}

export interface BettingOpenParams {
  id: number;
  type: string;
  name: string;
  selectCnt: number;
  isExclusive: boolean;
  reqInheritancePoint: boolean;
  openYearMonth: number;
  closeYearMonth: number;
  candidates: SelectItem[];
}

export interface BetParams {
  generalID: number;
  userID: number | null;
  bettingType: number[];
  amount: number;
}

export interface BettingContext {
  year: number;
  month: number;
  minGoldRequiredWhenBetting: number;
}
