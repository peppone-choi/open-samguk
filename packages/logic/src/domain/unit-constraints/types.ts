/**
 * GameUnitConstraint - 병종(유닛) 사용 제약 조건
 *
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/
 * 병종 선택/사용 시 국가/장수 조건을 검사하는 시스템
 */

export interface GameUnitConstraintContext {
  /** 장수 관직 레벨 (12 = 군주, 5+ = 수뇌) */
  officerLevel: number;
  /** 소유 도시 목록 { cityId: { level: number, ... } } */
  ownCities: Map<number, { level: number; name: string }>;
  /** 소유 지역 목록 { regionId: regionName } */
  ownRegions: Map<number, string>;
  /** 상대 연도 (게임 시작 후 경과 년수) */
  relativeYear: number;
  /** 국가 기술력 */
  tech: number;
  /** 국가 보조 변수 (연구 완료 여부 등) */
  nationAux: Map<string, number>;
}

export interface GameUnitConstraint {
  /**
   * 제약 조건 검사
   * @returns true면 해당 병종 사용 가능
   */
  test(ctx: GameUnitConstraintContext): boolean;

  /**
   * 제약 조건 설명 문자열
   */
  getInfo(): string;
}
