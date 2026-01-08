import { General, City } from "../entities.js";

/**
 * 도시 규모 명칭 매핑
 */
export const CityLevelNames: Record<number, string> = {
  1: "수",
  2: "진",
  3: "관",
  4: "이",
  5: "소",
  6: "중",
  7: "대",
  8: "특",
};

/**
 * 전력 병종 제한 인터페이스
 * 레거시: BaseGameUnitConstraint.php
 */
export interface UnitConstraintContext {
  general: General;
  ownCities: City[];
  ownRegions: number[];
  relativeYear: number;
  tech: number;
  nationAux: any;
  regionIdToNameMap: Record<number, string>;
}

export abstract class BaseUnitConstraint {
  abstract test(context: UnitConstraintContext): boolean;
  abstract getInfo(): string;
}

/**
 * 무조건 불가
 */
export class ImpossibleConstraint extends BaseUnitConstraint {
  test(): boolean {
    return false;
  }
  getInfo(): string {
    return "불가능";
  }
}

/**
 * 기술력 요구
 */
export class ReqTechConstraint extends BaseUnitConstraint {
  constructor(private readonly reqTech: number) {
    super();
  }
  test(context: UnitConstraintContext): boolean {
    return context.tech >= this.reqTech;
  }
  getInfo(): string {
    return `기술력 ${this.reqTech} 이상 필요`;
  }
}

/**
 * 특정 도시들 중 하나라도 소유하고 있는지 여부
 */
export class ReqCitiesConstraint extends BaseUnitConstraint {
  constructor(
    private readonly reqCityIds: number[],
    private readonly cityNames?: string[]
  ) {
    super();
  }
  test(context: UnitConstraintContext): boolean {
    const ownedIds = new Set(context.ownCities.map((c) => c.id));
    return this.reqCityIds.some((id) => ownedIds.has(id));
  }
  getInfo(): string {
    const names = this.cityNames ? this.cityNames.join(", ") : `도시[${this.reqCityIds.join(",")}]`;
    return `${names} 소유 시 가능`;
  }
}

/**
 * 특정 도시들 중 하나라도 특정 규모 이상인지 여부
 */
export class ReqCitiesWithCityLevelConstraint extends BaseUnitConstraint {
  constructor(
    private readonly reqMinLevel: number,
    private readonly reqCityIds: number[],
    private readonly cityNames?: string[]
  ) {
    super();
  }
  test(context: UnitConstraintContext): boolean {
    return context.ownCities.some(
      (c) => this.reqCityIds.includes(c.id) && c.level >= this.reqMinLevel
    );
  }
  getInfo(): string {
    const levelText = CityLevelNames[this.reqMinLevel] || this.reqMinLevel.toString();
    const names = this.cityNames ? this.cityNames.join(", ") : `도시[${this.reqCityIds.join(",")}]`;
    return `${names} ${levelText}성 소유 시 가능`;
  }
}

/**
 * 특정 규모 이상의 도시 개수 요구
 */
export class ReqHighLevelCitiesConstraint extends BaseUnitConstraint {
  constructor(
    private readonly reqMinLevel: number,
    private readonly reqCount: number
  ) {
    super();
  }
  test(context: UnitConstraintContext): boolean {
    const count = context.ownCities.filter((c) => c.level >= this.reqMinLevel).length;
    return count >= this.reqCount;
  }
  getInfo(): string {
    const levelText = CityLevelNames[this.reqMinLevel] || this.reqMinLevel.toString();
    return `${levelText}성 ${this.reqCount}개 이상 소유 시 가능`;
  }
}

/**
 * 특정 지역들 중 하나라도 소유하고 있는지 여부
 */
export class ReqRegionsConstraint extends BaseUnitConstraint {
  constructor(
    private readonly reqRegions: number[],
    private readonly regionNames?: string[]
  ) {
    super();
  }
  test(context: UnitConstraintContext): boolean {
    return this.reqRegions.some((r) => context.ownRegions.includes(r));
  }
  getInfo(): string {
    return `특정 지역 점유 필요`;
  }
}

/**
 * 국가 보조 데이터(NationAux) 조건
 */
export class ReqNationAuxConstraint extends BaseUnitConstraint {
  constructor(
    private readonly key: string,
    private readonly cmp: "==" | "!=" | "<" | ">" | "<=" | ">=",
    private readonly value: any,
    private readonly customInfo?: string
  ) {
    super();
  }
  test(context: UnitConstraintContext): boolean {
    const lhs = context.nationAux[this.key] ?? 0;
    const rhs = this.value;

    switch (this.cmp) {
      case "==":
        return lhs == rhs;
      case "!=":
        return lhs != rhs;
      case "<":
        return lhs < rhs;
      case ">":
        return lhs > rhs;
      case "<=":
        return lhs <= rhs;
      case ">=":
        return lhs >= rhs;
      default:
        return false;
    }
  }
  getInfo(): string {
    if (this.customInfo) return this.customInfo;
    return `${this.key} ${this.cmp} ${this.value} 일 때 가능`;
  }
}

/**
 * 상대 연도(경과 년수) 요구
 */
export class ReqMinRelYearConstraint extends BaseUnitConstraint {
  constructor(private readonly reqMinRelYear: number) {
    super();
  }
  test(context: UnitConstraintContext): boolean {
    return context.relativeYear >= this.reqMinRelYear;
  }
  getInfo(): string {
    return `${this.reqMinRelYear}년 경과 후 사용 가능`;
  }
}

/**
 * 수뇌부 여부 요구
 */
export class ReqChiefConstraint extends BaseUnitConstraint {
  test(context: UnitConstraintContext): boolean {
    return context.general.officerLevel >= 5;
  }
  getInfo(): string {
    return "군주 및 수뇌부만 가능";
  }
}

/**
 * 수뇌부 아님 요구
 */
export class ReqNotChiefConstraint extends BaseUnitConstraint {
  test(context: UnitConstraintContext): boolean {
    return context.general.officerLevel < 5;
  }
  getInfo(): string {
    return "군주 및 수뇌부는 불가";
  }
}

// 레거시 호환용 타입 가드 및 팩토리 메서드가 필요할 수 있음
