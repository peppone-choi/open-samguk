import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralDisbandCommand } from "./GeneralDisbandCommand.js";
import { GameConst } from "../GameConst.js";

describe("GeneralDisbandCommand", () => {
  const seed = "test-disband-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const createMockSnapshot = (): WorldSnapshot => ({
    generals: {
      1: {
        id: 1,
        name: "군주",
        nationId: 1,
        cityId: 1,
        gold: 5000,
        rice: 5000,
        leadership: 80,
        leadershipExp: 0,
        strength: 50,
        strengthExp: 0,
        intel: 50,
        intelExp: 0,
        politics: 50,
        politicsExp: 0,
        charm: 50,
        charmExp: 0,
        injury: 0,
        experience: 10000,
        dedication: 1000,
        crew: 1000,
        crewType: 1,
        train: 50,
        atmos: 50,
        age: 20,
        turnTime: new Date(),
        killTurn: 0,
        meta: {},
        penalty: {},
        officerLevel: 12,
        officerCity: 0,
        ownerId: 1,
        bornYear: 180,
        deadYear: 280,
        weapon: "",
        book: "",
        horse: "",
        item: "",
        recentWarTime: null,
        makeLimit: 0,
        block: 0,
        recentWar: 0,
        dex: {},
        special: "",
        specAge: 0,
        special2: "",
        specAge2: 0,
        defenceTrain: 80,
        tournamentState: 0,
        lastTurn: {},
        troopId: 0,
      },
      2: {
        id: 2,
        name: "부하1",
        nationId: 1,
        cityId: 1,
        gold: 3000,
        rice: 3000,
        leadership: 70,
        leadershipExp: 0,
        strength: 60,
        strengthExp: 0,
        intel: 40,
        intelExp: 0,
        politics: 50,
        politicsExp: 0,
        charm: 50,
        charmExp: 0,
        injury: 0,
        experience: 5000,
        dedication: 500,
        crew: 500,
        crewType: 1,
        train: 50,
        atmos: 50,
        age: 25,
        turnTime: new Date(),
        killTurn: 0,
        meta: {},
        penalty: {},
        officerLevel: 5,
        officerCity: 0,
        ownerId: 2,
        bornYear: 175,
        deadYear: 275,
        weapon: "",
        book: "",
        horse: "",
        item: "",
        recentWarTime: null,
        makeLimit: 0,
        block: 0,
        recentWar: 0,
        dex: {},
        special: "",
        specAge: 0,
        special2: "",
        specAge2: 0,
        defenceTrain: 80,
        tournamentState: 0,
        lastTurn: {},
        troopId: 0,
      },
    },
    nations: {
      1: {
        id: 1,
        name: "방랑군",
        color: "#FF0000",
        capitalCityId: 0,
        gold: 10000,
        rice: 10000,
        rate: 10,
        rateTmp: 10,
        tech: 0,
        power: 1000,
        level: 0,
        gennum: 2, // 방랑 세력 (level 0)
        typeCode: "che_중립",
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 36,
        surrenderLimit: 72,
        spy: {},
        meta: {},
        chiefGeneralId: 1,
      },
    },
    cities: {
      1: {
        id: 1,
        name: "성도",
        nationId: 0,
        supply: 0,
        pop: 10000,
        popMax: 10000,
        agri: 5000,
        agriMax: 10000,
        comm: 5000,
        commMax: 10000,
        secu: 100,
        secuMax: 100,
        def: 1000,
        defMax: 1000,
        wall: 1000,
        wallMax: 1000,
        trust: 100,
        gold: 0,
        rice: 0,
        region: 1,
        state: 0,
        term: 0,
        conflict: {},
        meta: {},
        level: 5,
        front: 0,
      },
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 184, month: 2 }, // 초기 턴 이후
    env: { init_year: 184, init_month: 1 },
  });

  it("방랑 세력 해산 시 모든 장수가 재야가 되어야 함", () => {
    const cmd = new GeneralDisbandCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals?.[1]?.nationId).toBe(0);
    expect(delta.generals?.[2]?.nationId).toBe(0);
    expect(delta.generals?.[1]?.officerLevel).toBe(0);
    expect(delta.generals?.[2]?.officerLevel).toBe(0);
    expect(delta.nations?.[1]?.level).toBe(-1);
    expect(delta.logs?.general?.[1]?.[0]).toContain("해산");
  });

  it("군주는 건국 제한이 해제되어야 함", () => {
    const cmd = new GeneralDisbandCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals?.[1]?.makeLimit).toBe(12);
  });

  it("초기 턴에는 해산할 수 없어야 함", () => {
    const cmd = new GeneralDisbandCommand();
    const snapshot = createMockSnapshot();
    snapshot.gameTime = { year: 184, month: 1 }; // 초기 턴
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("다음 턴부터");
  });

  it("영토 있는 국가는 해산할 수 없어야 함", () => {
    const cmd = new GeneralDisbandCommand();
    const snapshot = createMockSnapshot();
    snapshot.nations[1].level = 1; // 영토 있음
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("군주가 아니면 해산할 수 없어야 함", () => {
    const cmd = new GeneralDisbandCommand();
    const snapshot = createMockSnapshot();
    snapshot.generals[1].officerLevel = 5;
    snapshot.nations[1].chiefGeneralId = 99;
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("장수 자원이 기본값으로 제한되어야 함", () => {
    const cmd = new GeneralDisbandCommand();
    const snapshot = createMockSnapshot();
    snapshot.generals[1].gold = 50000;
    snapshot.generals[1].rice = 50000;
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals?.[1]?.gold).toBe(GameConst.defaultGold);
    expect(delta.generals?.[1]?.rice).toBe(GameConst.defaultRice);
  });
});
