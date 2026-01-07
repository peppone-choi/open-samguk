import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, General, Nation, City } from "../entities.js";
import { NationMobilizeCommand } from "./NationMobilizeCommand.js";

function createGeneral(overrides: Partial<General> = {}): General {
  return {
    id: 1,
    nationId: 1,
    name: "유비",
    officerLevel: 12,
    ...overrides,
  } as any;
}

function createNation(overrides: Partial<Nation> = {}): Nation {
  return {
    id: 1,
    name: "촉",
    ...overrides,
  } as any;
}

function createCity(overrides: Partial<City> = {}): City {
  return {
    id: 1,
    name: "성도",
    nationId: 1,
    def: 100,
    defMax: 1000,
    wall: 100,
    wallMax: 1000,
    ...overrides,
  } as any;
}

describe("NationMobilizeCommand", () => {
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
      1: createCity({ id: 1 }),
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 186, month: 1 },
    env: {},
  } as any;

  it("백성동원 발동 시 도시 수비와 성벽이 80%가 되어야 함", () => {
    const cmd = new NationMobilizeCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { destCityId: 1 });

    expect(delta.cities?.[1]?.def).toBe(800);
    expect(delta.cities?.[1]?.wall).toBe(800);
    expect(delta.logs?.general?.[1][0]).toContain("백성동원 발동");
  });

  it("대상 도시가 없으면 실패해야 함", () => {
    const cmd = new NationMobilizeCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {});

    expect(delta.logs?.general?.[1][0]).toContain("실패");
    expect(delta.cities).toBeUndefined();
  });
});
