import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, General, Nation, City } from "../entities.js";
import { NationProposeAllianceCommand } from "./NationProposeAllianceCommand.js";

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
    officerLevel: 12, // 수뇌
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
    aux: {},
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

describe("NationProposeAllianceCommand", () => {
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
        chiefGeneralId: 1,
        capitalCityId: 5,
      }),
      2: createNation({
        id: 2,
        name: "오",
        chiefGeneralId: 0,
        capitalCityId: 7,
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

  it("평화 상태에서 동맹 제의 시 성공해야 함 (6개월 이상 기한)", () => {
    const cmd = new NationProposeAllianceCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {
      destNationId: 2,
      year: 186,
      month: 7, // 6개월 후
    });

    // 메시지 생성 확인
    expect(delta.messages).toBeDefined();
    expect(delta.messages?.length).toBe(1);
    expect(delta.messages?.[0]?.meta?.action).toBe("propose_alliance");
    // 로그 확인
    expect(delta.logs?.general?.[1][0]).toContain("동맹 제의 서신");
  });

  it("6개월 미만 기한으로는 동맹 제의할 수 없어야 함", () => {
    const cmd = new NationProposeAllianceCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {
      destNationId: 2,
      year: 186,
      month: 5, // 4개월 후 (6개월 미만)
    });

    expect(delta.logs?.general?.[1][0]).toContain("6개월 이상");
    expect(delta.messages).toBeUndefined();
  });

  it("교전중인 국가에는 동맹 제의할 수 없어야 함", () => {
    const snapshot: WorldSnapshot = {
      ...baseSnapshot,
      diplomacy: {
        "1:2": {
          id: 1,
          srcNationId: 1,
          destNationId: 2,
          state: "0", // 교전중
          term: 24,
          meta: {},
        },
      },
    };

    const cmd = new NationProposeAllianceCommand();
    const delta = cmd.run(rand, snapshot, 1, {
      destNationId: 2,
      year: 186,
      month: 7,
    });

    expect(delta.logs?.general?.[1][0]).toContain("이미 교전중입니다");
    expect(delta.messages).toBeUndefined();
  });

  it("선포중인 국가에는 동맹 제의할 수 없어야 함", () => {
    const snapshot: WorldSnapshot = {
      ...baseSnapshot,
      diplomacy: {
        "1:2": {
          id: 1,
          srcNationId: 1,
          destNationId: 2,
          state: "1", // 선포중
          term: 24,
          meta: {},
        },
      },
    };

    const cmd = new NationProposeAllianceCommand();
    const delta = cmd.run(rand, snapshot, 1, {
      destNationId: 2,
      year: 186,
      month: 7,
    });

    expect(delta.logs?.general?.[1][0]).toContain("이미 선포중입니다");
  });

  it("자국에는 동맹 제의할 수 없어야 함", () => {
    const cmd = new NationProposeAllianceCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {
      destNationId: 1,
      year: 186,
      month: 7,
    });

    expect(delta.logs?.general?.[1][0]).toContain("자국에게는");
  });

  it("대상 국가가 없으면 실패해야 함", () => {
    const cmd = new NationProposeAllianceCommand();
    const delta = cmd.run(rand, baseSnapshot, 1, {
      destNationId: 99,
      year: 186,
      month: 7,
    });

    expect(delta.logs?.general?.[1][0]).toContain("대상 국가를 찾을 수 없습니다");
  });
});
