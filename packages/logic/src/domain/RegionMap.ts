export const RegionNameMap: Record<string, number> = {
  하북: 1,
  중원: 2,
  서북: 3,
  서촉: 4,
  남중: 5,
  초: 6,
  오월: 7,
  동이: 8,
};

export const RegionIdMap: Record<number, string> = Object.entries(RegionNameMap).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {} as Record<number, string>
);
