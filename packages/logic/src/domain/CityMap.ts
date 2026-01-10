import CityNameMapRaw from "./scenario/data/maps/che/CityMap.json";

/**
 * 도시 이름과 숫자 ID 간의 매핑 테이블 (치-CHE 시나리오 기준)
 */
export const CityNameMap: Record<string, number> = CityNameMapRaw;

/**
 * 숫자 ID와 도시 이름 간의 역매핑 테이블
 */
export const CityIdMap: Record<number, string> = Object.entries(CityNameMap).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {} as Record<number, string>
);
