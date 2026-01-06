import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot, General, Nation, City } from "../entities.js";
import { NationAdjustTaxCommand } from "./NationAdjustTaxCommand.js";

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
    officerLevel: 12, // 군주 (BeLord는 chiefGeneralId 체크)
    officerCity: 0,
    recentWar: 0,
    crew: 0,
    crewType: 0,
    train: 0,
    atmos: 0,
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
  };
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
    ...overrides,
  };
}

function createCity(overrides: Partial<City> = {}): City {
  return {
    id: 1,
    name: "성도",
    nationId: 1,
    level: 8,
    supply: 1,
    front: 0,
    pop: 100000,
    popMax: 200000,
    agri: 5000,
    agriMax: 10000,
    comm: 5000,
    commMax: 10000,
    secu: 5000,
    secuMax: 10000,
    def: 5000,
    defMax: 10000,
    wall: 5000,
    wallMax: 10000,
    trust: 80,
    gold: 1000,
    rice: 1000,
    region: 4,
    state: 0,
    term: 0,
    conflict: {},
    meta: {},
    ...overrides,
  };
}

describe("NationAdjustTaxCommand", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const baseSnapshot: WorldSnapshot = {
    generals: {
      1: createGeneral({ id: 1, name: "유비", nationId: 1, cityId: 5 }),
    },
    nations: {
      1: createNation({
        id: 1,
        name: "촉",
        chiefGeneralId: 1, // 유비가 군주
        capitalCityId: 5,
        rate: 10,
      }),
    },
    cities: {
      5: createCity({ id: 5, name: "성도", nationId: 1 }),
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 186, month: 1 },
    env: { startyear: 184 },
  };

  it("세금 조정 시 국가의 세율이 변경되어야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { rate: 20 });

    // 국가 세율 변경 확인
    expect(delta.nations?.[1]?.rate).toBe(20);
    // 로그 확인
    expect(delta.logs?.general?.[1][0]).toContain("10%에서 20%");
    expect(delta.logs?.nation?.[1][0]).toContain("세율을 20%");
  });

  it("세율을 0%로 낮출 수 있어야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { rate: 0 });

    expect(delta.nations?.[1]?.rate).toBe(0);
    expect(delta.logs?.general?.[1][0]).toContain("0%");
  });

  it("세율을 50%로 높일 수 있어야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { rate: 50 });

    expect(delta.nations?.[1]?.rate).toBe(50);
    expect(delta.logs?.general?.[1][0]).toContain("50%");
  });

  it("50%를 초과하는 세율은 설정할 수 없어야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { rate: 51 });

    expect(delta.logs?.general?.[1][0]).toContain("0%에서 50% 사이");
    expect(delta.nations).toBeUndefined();
  });

  it("음수 세율은 설정할 수 없어야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { rate: -1 });

    expect(delta.logs?.general?.[1][0]).toContain("0%에서 50% 사이");
  });

  it("현재 세율과 동일하면 변경할 수 없어야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { rate: 10 }); // 현재 세율 10%

    expect(delta.logs?.general?.[1][0]).toContain("현재 세율과 동일합니다");
    expect(delta.nations).toBeUndefined();
  });

  it("정수가 아닌 세율은 설정할 수 없어야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, { rate: 10.5 });

    expect(delta.logs?.general?.[1][0]).toContain("정수여야 합니다");
  });

  it("세율이 지정되지 않으면 실패해야 함", () => {
    const cmd = new NationAdjustTaxCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {});

    expect(delta.logs?.general?.[1][0]).toContain("세율이 지정되지 않았습니다");
  });
});
