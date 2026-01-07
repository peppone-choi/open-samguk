import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, General, Nation, City } from "../entities.js";
import { NationMigratePopulationCommand } from "./NationMigratePopulationCommand.js";

function createGeneral(overrides: Partial<General> = {}): General {
  return {
    id: 1,
    nationId: 1,
    name: "유비",
    cityId: 1,
    officerLevel: 12,
    npc: 0,
    ...overrides,
  } as any;
}

function createNation(overrides: Partial<Nation> = {}): Nation {
  return { id: 1, name: "촉", gold: 10000, rice: 10000, ...overrides } as any;
}

function createCity(overrides: Partial<City> = {}): City {
  return { id: 1, name: "성도", nationId: 1, pop: 200000, ...overrides } as any;
}

describe("NationMigratePopulationCommand", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const baseSnapshot: WorldSnapshot = {
    generals: {
      1: createGeneral({ id: 1 }),
    },
    nations: {
      1: createNation({ id: 1 }),
    },
    cities: {
      1: createCity({ id: 1, pop: 200000 }),
      2: createCity({ id: 2, name: "덕양", nationId: 1, pop: 50000 }),
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 186, month: 1 },
    env: { develcost: 100 },
  } as any;

  it("인구이동 발동 시 출발지 인구가 줄고 도착지 인구가 늘어야 함", () => {
    const cmd = new NationMigratePopulationCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { destCityId: 2, amount: 50000 });

    expect(delta.cities?.[1]?.pop).toBe(150000); // 200000 - 50000
    expect(delta.cities?.[2]?.pop).toBe(100000); // 50000 + 50000
    expect(delta.logs?.general?.[1][0]).toContain("50,000명을 옮겼습니다");
  });

  it("국고가 부족하면 실패해야 함", () => {
    const snapshot = {
      ...baseSnapshot,
      nations: {
        1: createNation({ id: 1, gold: 0 }),
      },
    } as any;
    const cmd = new NationMigratePopulationCommand();
    const delta = cmd.run(rand, snapshot, 1, { destCityId: 2, amount: 50000 });

    expect(delta.logs?.general?.[1][0]).toContain("실패");
    expect(delta.cities).toBeUndefined();
  });
});
