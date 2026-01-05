import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import {
  SpecialWeightType,
  SpecialType,
  type WarUnit,
  type WarUnitTriggerCaller,
  type GeneralTriggerCaller,
} from "../types";

/**
 * Medicine (의술) - War Special Ability
 * [군사] 매 턴마다 자신(100%)과 소속 도시 장수(적 포함 50%) 부상 회복
 * [전투] 페이즈마다 40% 확률로 치료 발동(아군 피해 30% 감소, 부상 회복)
 */
export class MedicineSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.PERCENT;
  static readonly selectWeight = 2;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP,
    SpecialType.STAT_STRENGTH,
    SpecialType.STAT_INTEL,
  ];

  id = 73;
  name = "의술";
  info =
    "[군사] 매 턴마다 자신(100%)과 소속 도시 장수(적 포함 50%) 부상 회복<br>[전투] 페이즈마다 40% 확률로 치료 발동(아군 피해 30% 감소, 부상 회복)";

  getPreTurnExecuteTriggerList(_general: General): GeneralTriggerCaller | null {
    // TODO: Implement che_도시치료 trigger
    // return new GeneralTriggerCaller(
    //   new CityHealingTrigger(general)
    // );
    return null;
  }

  getBattlePhaseSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    // TODO: Implement che_전투치료시도 and che_전투치료발동 triggers
    // return new WarUnitTriggerCaller(
    //   new BattleHealingAttemptTrigger(unit),
    //   new BattleHealingActivateTrigger(unit)
    // );
    return null;
  }
}
