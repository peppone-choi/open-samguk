/**
 * 낙주(징병) - che_징병_낙주.php 포팅
 * [군사] 징·모병비 -30%
 * [기타] 통솔 순수 능력치 보정 +15%, 징병/모병/소집해제 시 인구 변동 없음
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName, DomesticTurnType, DomesticVarType } from "../types.js";

export class RecruitmentItem extends BaseItem {
  readonly code = "che_징병_낙주";
  readonly rawName = "낙주";
  readonly name = "낙주(징병)";
  readonly info = "[군사] 징·모병비 -30%\n[기타] 통솔 순수 능력치 보정 +15%, 징병/모병/소집해제 시 인구 변동 없음";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(
    turnType: DomesticTurnType,
    varType: DomesticVarType,
    value: number,
    _aux?: unknown
  ): number {
    // 징·모병비 -30%
    if ((turnType === "징병" || turnType === "모병") && varType === "cost") {
      return value * 0.7;
    }

    // 인구 변동 없음 (score = 0)
    if (turnType === "징집인구" && varType === "score") {
      return 0;
    }

    return value;
  }

  onCalcStat(general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    // 통솔 순수 능력치 보정 +15%
    if (statName === "leadership") {
      const baseLeadership = (general as any).leadership ?? 0;
      return value + baseLeadership * 0.15;
    }
    return value;
  }
}
