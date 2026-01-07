import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, General, Nation, Diplomacy } from "../entities.js";
import { NationEconomicWarfareCommand } from "./NationEconomicWarfareCommand.js";

function createGeneral(overrides: Partial<General> = {}): General {
  return { id: 1, nationId: 1, name: "유비", officerLevel: 12, ...overrides } as any;
}

function createNation(overrides: Partial<Nation> = {}): Nation {
  return { id: 1, name: "촉", ...overrides } as any;
}

describe("NationEconomicWarfareCommand", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const baseSnapshot: WorldSnapshot = {
    generals: {
      1: createGeneral({ id: 1 }),
    },
    nations: {
      1: createNation({ id: 1, name: "촉" }),
      2: createNation({ id: 2, name: "위" }),
    },
    cities: {
      1: { id: 1, name: "성도", nationId: 1 } as any,
    },
    diplomacy: {
      "1:2": { id: 1, srcNationId: 1, destNationId: 2, state: "0", term: 24, meta: {} },
    },
    troops: {},
    messages: {},
    gameTime: { year: 186, month: 1 },
    env: {},
  } as any;

  it("이호경식 발동 시 대상 국가와의 외교 상태가 선포(state: 1)로 변경되어야 함", () => {
    const cmd = new NationEconomicWarfareCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { destNationId: 2 });

    expect(delta.diplomacy?.["1:2"]?.state).toBe("1");
    expect(delta.diplomacy?.["1:2"]?.term).toBe(3);
    expect(delta.logs?.general?.[1][0]).toContain("이호경식을 발동");
  });

  it("선포 중인 국가에 발동 시 기간이 연장되어야 함", () => {
    const snapshot = {
      ...baseSnapshot,
      diplomacy: {
        "1:2": { id: 1, srcNationId: 1, destNationId: 2, state: "1", term: 5, meta: {} },
      },
    } as any;
    const cmd = new NationEconomicWarfareCommand();
    const delta = cmd.run(rand, snapshot, 1, { destNationId: 2 });

    expect(delta.diplomacy?.["1:2"]?.state).toBe("1");
    expect(delta.diplomacy?.["1:2"]?.term).toBe(8);
  });
});
