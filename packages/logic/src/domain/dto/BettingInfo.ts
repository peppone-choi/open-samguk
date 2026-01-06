import type { SelectItem } from "./SelectItem";

export interface BettingInfo {
  id: number;
  type: string;
  name: string;
  finished: boolean;
  selectCnt: number;
  isExclusive: boolean | null;
  reqInheritancePoint: boolean;
  openYearMonth: number;
  closeYearMonth: number;
  candidates: SelectItem[];
  winner: unknown[] | null;
}
