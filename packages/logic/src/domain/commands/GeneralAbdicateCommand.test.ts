import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralAbdicateCommand } from "./GeneralAbdicateCommand.js";

describe("GeneralAbdicateCommand", () => {
  const seed = "test-abdicate-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const createMockSnapshot = (): WorldSnapshot => ({
    generals: {
      1: {
        id: 1,
        name: "군주장수",
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
        officerCity: 1,
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
        npc: 0,
        startAge: 20,
        belong: 1,
        betray: 0,
        dedLevel: 0,
        expLevel: 0,
        officerLock: 0,
        affinity: 500,
        personal: "None",
      },
      2: {
        id: 2,
        name: "후계자",
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
        npc: 0,
        startAge: 25,
        belong: 1,
        betray: 0,
        dedLevel: 0,
        expLevel: 0,
        officerLock: 0,
        affinity: 500,
        personal: "None",
      },
      3: {
        id: 3,
        name: "적국장수",
        nationId: 2,
        cityId: 2,
        gold: 3000,
        rice: 3000,
        leadership: 60,
        leadershipExp: 0,
        strength: 70,
        strengthExp: 0,
        intel: 50,
        intelExp: 0,
        politics: 50,
        politicsExp: 0,
        charm: 50,
        charmExp: 0,
        injury: 0,
        experience: 3000,
        dedication: 300,
        crew: 300,
        crewType: 1,
        train: 50,
        atmos: 50,
        age: 30,
        turnTime: new Date(),
        killTurn: 0,
        meta: {},
        penalty: {},
        officerLevel: 1,
        officerCity: 0,
        ownerId: 3,
        bornYear: 170,
        deadYear: 270,
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
        npc: 0,
        startAge: 30,
        belong: 1,
        betray: 0,
        dedLevel: 0,
        expLevel: 0,
        officerLock: 0,
        affinity: 500,
        personal: "None",
      },
    },
    nations: {
      1: {
        id: 1,
        name: "촉한",
        color: "#FF0000",
        capitalCityId: 1,
        gold: 10000,
        rice: 10000,
        rate: 10,
        rateTmp: 10,
        tech: 0,
        power: 1000,
        level: 1,
        gennum: 2,
        typeCode: "che_왕도",
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 36,
        surrenderLimit: 72,
        spy: {},
        meta: {},
        aux: {},
        chiefGeneralId: 1,
      },
      2: {
        id: 2,
        name: "위",
        color: "#0000FF",
        capitalCityId: 2,
        gold: 10000,
        rice: 10000,
        rate: 10,
        rateTmp: 10,
        tech: 0,
        power: 1000,
        level: 1,
        gennum: 1,
        typeCode: "che_패도",
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 36,
        surrenderLimit: 72,
        spy: {},
        meta: {},
        aux: {},
        chiefGeneralId: 3,
      },
    },
    cities: {
      1: {
        id: 1,
        name: "성도",
        nationId: 1,
        supply: 1,
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
        trade: 100,
        dead: 0,
        region: 1,
        state: 0,
        term: 0,
        conflict: {},
        meta: {},
        level: 5,
        front: 0,
      },
      2: {
        id: 2,
        name: "업",
        nationId: 2,
        supply: 1,
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
        trade: 100,
        dead: 0,
        region: 2,
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
    gameTime: { year: 184, month: 1 },
    env: {},
    generalTurns: {},
  });

  it("정상 선양 시 officerLevel이 교환되어야 함", () => {
    const cmd = new GeneralAbdicateCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, { destGeneralId: 2 });

    expect(delta.generals?.[1]?.officerLevel).toBe(1);
    expect(delta.generals?.[2]?.officerLevel).toBe(12);
    expect(delta.generals?.[1]?.officerCity).toBe(0);
    expect(delta.generals?.[2]?.officerCity).toBe(0);
    expect(delta.nations?.[1]?.chiefGeneralId).toBe(2);
  });

  it("경험치가 30% 감소해야 함", () => {
    const cmd = new GeneralAbdicateCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, { destGeneralId: 2 });

    expect(delta.generals?.[1]?.experience).toBe(Math.floor(10000 * 0.7));
  });

  it("페널티 있는 장수에게 선양할 수 없어야 함", () => {
    const cmd = new GeneralAbdicateCommand();
    const snapshot = createMockSnapshot();
    snapshot.generals[2].penalty = { NoChief: true };
    const delta = cmd.run(rand, snapshot, 1, { destGeneralId: 2 });

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("선양할 수 없는 장수입니다");
  });

  it("다른 국가 장수에게 선양할 수 없어야 함", () => {
    const cmd = new GeneralAbdicateCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, { destGeneralId: 3 });

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("군주가 아니면 실행할 수 없어야 함", () => {
    const cmd = new GeneralAbdicateCommand();
    const snapshot = createMockSnapshot();
    snapshot.generals[1].officerLevel = 5;
    snapshot.nations[1].chiefGeneralId = 99;
    const delta = cmd.run(rand, snapshot, 1, { destGeneralId: 2 });

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("로그에 선양 메시지가 포함되어야 함", () => {
    const cmd = new GeneralAbdicateCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, { destGeneralId: 2 });

    expect(delta.logs?.general?.[1]?.[0]).toContain("물려줍니다");
    expect(delta.logs?.general?.[2]?.[0]).toContain("물려받습니다");
    expect(delta.logs?.global?.[0]).toContain("선양");
    expect(delta.logs?.nation?.[1]?.[0]).toContain("선양");
  });
});
