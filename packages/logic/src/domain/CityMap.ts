import CityNameMapRaw from "./scenario/data/maps/che/CityMap.json";

export const CityNameMap: Record<string, number> = CityNameMapRaw;

export const CityIdMap: Record<number, string> = Object.entries(CityNameMap).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {} as Record<number, string>
);
