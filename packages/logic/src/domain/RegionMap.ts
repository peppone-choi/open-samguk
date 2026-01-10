import RegionNameMapRaw from "./scenario/data/maps/che/RegionMap.json";

/**
 * 지역 이름과 숫자 ID 간의 매핑 테이블 (치-CHE 시나리오 기준)
 */
export const RegionNameMap: Record<string, number> = RegionNameMapRaw;

/**
 * 숫자 ID와 지역 이름 간의 역매핑 테이블
 */
export const RegionIdMap: Record<number, string> = Object.entries(RegionNameMap).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {} as Record<number, string>
);
