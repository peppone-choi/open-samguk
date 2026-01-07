import { BaseSpecial } from "../BaseSpecial";
import { SpecialWeightType, SpecialType, type WarUnit } from "../types";

export class ExorcistSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP,
    SpecialType.STAT_STRENGTH,
    SpecialType.STAT_INTEL,
  ];

  id = 75;
  name = "척사";
  info = "[전투] 지역·도시 병종 상대로 대미지 +20%, 아군 피해 -20%";

  getWarPowerMultiplier(unit: WarUnit): [number, number] {
    const oppose = unit.getOppose();
    if (!oppose || !("crewType" in oppose)) {
      return [1, 1];
    }

    const opposeCrewType = oppose.crewType;
    const isRegionalOrCityType = this.isRegionalOrCityCrewType(opposeCrewType);

    if (isRegionalOrCityType) {
      return [1.2, 0.8];
    }
    return [1, 1];
  }

  private isRegionalOrCityCrewType(crewType: number): boolean {
    // Regional/city crew types that require specific regions or cities
    // Based on legacy reqCities() or reqRegions() checks
    const regionalCityTypes = [
      10, // 산저병 (산악 지역)
      11, // 원융노병 (남만 지역)
      12, // 상병 (남만 지역)
      13, // 음귀병 (남만 지역)
      14, // 화륜차 (촉 지역)
      20, // 화시병 (양주 도시)
      21, // 대검병 (특정 도시)
      22, // 무희 (서량 도시)
      23, // 극병 (특정 도시)
    ];
    return regionalCityTypes.includes(crewType);
  }
}
