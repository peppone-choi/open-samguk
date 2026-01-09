import { BaseSpecial } from "../BaseSpecial";
import {
  SpecialWeightType,
  SpecialType,
  type WarUnit,
  WarUnitTriggerCaller,
  RaiseType,
} from "../types";
import { RageAttemptTrigger } from "../../triggers/war/RageAttemptTrigger.js";
import { RageActivateTrigger } from "../../triggers/war/RageActivateTrigger.js";

/**
 * Fury (격노) - War Special Ability
 * [전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동,
 * 공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩
 */
export class FurySpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 74;
  name = "격노";
  info =
    "[전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동, 공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩";

  getWarPowerMultiplier(unit: WarUnit): [number, number] {
    const activatedCnt = unit.hasActivatedSkillOnLog("격노");
    return [1 + 0.2 * activatedCnt, 1];
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null {
    return new WarUnitTriggerCaller(
      new RageAttemptTrigger(unit, RaiseType.SPECIAL),
      new RageActivateTrigger(unit, RaiseType.SPECIAL)
    );
  }
}
