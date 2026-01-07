import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, General, Nation, City } from "../entities.js";
import { NationRecruitMilitiaCommand } from "./NationRecruitMilitiaCommand.js";

function createGeneral(overrides: Partial<General> = {}): General {
  return {
    id: 1,
    nationId: 1,
    name: "유비",
    officerLevel: 12,
    dedication: 1000,
    experience: 1000,
    ...overrides,
  } as any;
}

function createNation(overrides: Partial<Nation> = {}): Nation {
  return {
    id: 1,
    name: "촉",
    level: 1,
    ...overrides,
  } as any;
}

describe("NationRecruitMilitiaCommand", () => {
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
      1: { id: 1, name: "성도", nationId: 1 } as any,
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 186, month: 1 },
    env: {},
  } as any;

  it("의병모집 발동 시 env.npcRecruitment가 설정되어야 함", () => {
    const cmd = new NationRecruitMilitiaCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {});

    expect(delta.env?.npcRecruitment).toBeDefined();
    expect(delta.env?.npcRecruitment.nationId).toBe(1);
    expect(delta.env?.npcRecruitment.npcType).toBe(4);
    expect(delta.logs?.general?.[1][0]).toContain("의병모집 발동");
  });
});
