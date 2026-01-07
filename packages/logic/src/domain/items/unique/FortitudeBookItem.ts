/**
 * 상편(불굴) - che_불굴_상편.php 포팅
 * [전투] 남은 병력이 적을수록 공격력 증가. 최대 +60%
 */
import { BaseItem } from "../BaseItem.js";
import type { WarPowerMultiplier, WarUnitReadOnly } from "../types.js";

export class FortitudeBookItem extends BaseItem {
  readonly code = "che_불굴_상편";
  readonly rawName = "상편";
  readonly name = "상편(불굴)";
  readonly info = "[전투] 남은 병력이 적을수록 공격력 증가. 최대 +60%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const general = unit.getGeneral();
    const leadership = general.leadership;
    const crew = general.crew;

    // 병력 비율 계산 (0~1)
    const maxCrew = leadership * 100;
    const crewRatio = Math.max(0, Math.min(1, crew / maxCrew));

    // 병력이 적을수록 공격력 증가 (최대 +60%)
    const attackBonus = 1 + 0.6 * (1 - crewRatio);
    return [attackBonus, 1];
  }

  // TODO: getBattlePhaseSkillTriggerList 구현
  // new 전투력보정(unit, attackBonus)
}
