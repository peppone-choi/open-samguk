import RegionNameMapRaw from "./scenario/data/RegionMap.json";

export const RegionNameMap: Record<string, number> = RegionNameMapRaw;

export const RegionIdMap: Record<number, string> = Object.entries(RegionNameMap).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {} as Record<number, string>
);
