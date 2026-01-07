import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, General, Nation } from "../entities.js";
import { NationDesperateCommand } from "./NationDesperateCommand.js";

function createGeneral(overrides: Partial<General> = {}): General {
  return {
    id: 1,
    name: "테스트장수",
    ownerId: 1,
    nationId: 1,
    cityId: 1,
    troopId: 0,
    gold: 1000,
    rice: 1000,
    leadership: 70,
    leadershipExp: 0,
    strength: 70,
    strengthExp: 0,
    intel: 70,
    intelExp: 0,
    politics: 70,
    politicsExp: 0,
    charm: 70,
    charmExp: 0,
    injury: 0,
    experience: 0,
    dedication: 0,
    officerLevel: 12,
    officerCity: 0,
    recentWar: 0,
    crew: 0,
    crewType: 0,
    train: 50,
    atmos: 50,
    dex: {},
    age: 30,
    bornYear: 160,
    deadYear: 220,
    special: "None",
    specAge: 0,
    special2: "None",
    specAge2: 0,
    weapon: "",
    book: "",
    horse: "",
    item: "",
    turnTime: new Date(),
    recentWarTime: null,
    makeLimit: 0,
    killTurn: 10,
    block: 0,
    defenceTrain: 0,
    tournamentState: 0,
    lastTurn: {},
    meta: {},
    penalty: {},
    ...overrides,
  } as any;
}

function createNation(overrides: Partial<Nation> = {}): Nation {
  return {
    id: 1,
    name: "촉",
    color: "#ff0000",
    chiefGeneralId: 1,
    capitalCityId: 1,
    gold: 10000,
    rice: 10000,
    rate: 10,
    rateTmp: 0,
    tech: 100,
    power: 1000,
    level: 1,
    gennum: 5,
    typeCode: "che_국가",
    scoutLevel: 0,
    warState: 0,
    strategicCmdLimit: 0,
    surrenderLimit: 0,
    spy: {},
    meta: {},
    aux: {},
    ...overrides,
  };
}

describe("NationDesperateCommand", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const baseSnapshot: WorldSnapshot = {
    generals: {
      1: createGeneral({ id: 1, name: "유비", nationId: 1, train: 50, atmos: 50 }),
      2: createGeneral({ id: 2, name: "장비", nationId: 1, train: 30, atmos: 30 }),
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

  it("필사즉생 발동 시 아국 모든 장수의 훈련도와 사기가 100이 되어야 함", () => {
    const cmd = new NationDesperateCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {});

    expect(delta.generals?.[1]?.train).toBe(100);
    expect(delta.generals?.[1]?.atmos).toBe(100);
    expect(delta.generals?.[2]?.train).toBe(100);
    expect(delta.generals?.[2]?.atmos).toBe(100);
    expect(delta.logs?.general?.[1][0]).toContain("필사즉생 발동");
  });

  it("전쟁 중이 아니면 실패해야 함", () => {
    const snapshot = {
      ...baseSnapshot,
      diplomacy: {
        "1:2": { id: 1, srcNationId: 1, destNationId: 2, state: "7", term: 24, meta: {} },
      },
    } as any;
    const cmd = new NationDesperateCommand();
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.logs?.general?.[1][0]).toContain("실패");
    expect(delta.generals).toBeUndefined();
  });
});
