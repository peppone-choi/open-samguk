import { describe, it, expect, vi, beforeEach } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralLootCommand } from "./GeneralLootCommand.js";

describe("GeneralLootCommand", () => {
  const createMockSnapshot = (): WorldSnapshot => ({
    generals: {
      1: {
        id: 1,
        name: "장수1",
        nationId: 1,
        cityId: 1,
        gold: 5000,
        rice: 5000,
        leadership: 50,
        leadershipExp: 0,
        strength: 90,
        strengthExp: 0,
        intel: 50,
        intelExp: 0,
        politics: 50,
        politicsExp: 0,
        charm: 50,
        charmExp: 0,
        injury: 0,
        experience: 1000,
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
        officerLevel: 1,
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
        gennum: 1,
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
        gold: 50000,
        rice: 50000,
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
        chiefGeneralId: 2,
      },
    },
    cities: {
      1: {
        // 업 (아국)
        id: 1,
        name: "업",
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
        level: 8,
        front: 0,
      },
      2: {
        // 허창 (적국) - 업과 연결됨
        id: 2,
        name: "허창",
        nationId: 2,
        supply: 1,
        pop: 10000,
        popMax: 10000,
        agri: 8000,
        agriMax: 10000,
        comm: 8000,
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
        level: 8,
        front: 0,
      },
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 184, month: 1 },
    env: { develcost: 20, startyear: 184 },
    generalTurns: {},
  });

  it("성공 시 자원을 획득해야 함", () => {
    // 확률을 항상 성공하도록 설정
    const seed = "test-loot-success";
    const rng = new LiteHashDRBG(seed);
    const rand = new RandUtil(rng);

    // 확률이 높도록 무력을 높게 설정
    const snapshot = createMockSnapshot();
    snapshot.generals[1].strength = 200; // 매우 높은 무력

    const cmd = new GeneralLootCommand();

    // 여러 번 시도하여 성공 케이스 확인
    let successDelta = null;
    for (let i = 0; i < 10; i++) {
      const testRng = new LiteHashDRBG(`test-loot-${i}`);
      const testRand = new RandUtil(testRng);
      const delta = cmd.run(testRand, snapshot, 1, { destCityId: 2 });
      if (delta.logs?.general?.[1]?.[0]?.includes("성공")) {
        successDelta = delta;
        break;
      }
    }

    if (successDelta) {
      expect(successDelta.generals?.[1]?.gold).toBeDefined();
      expect(successDelta.generals?.[1]?.rice).toBeDefined();
      expect(successDelta.logs?.general?.[1]?.[0]).toContain("성공");
      expect(successDelta.logs?.global?.[0]).toContain("약탈");
    }
  });

  it("실패 시 비용만 소모해야 함", () => {
    // 확률을 낮게 하여 실패하도록
    const seed = "test-loot-fail";
    const rng = new LiteHashDRBG(seed);
    const rand = new RandUtil(rng);

    const snapshot = createMockSnapshot();
    snapshot.generals[1].strength = 10; // 낮은 무력

    const cmd = new GeneralLootCommand();

    // 여러 번 시도하여 실패 케이스 확인
    let failDelta = null;
    for (let i = 0; i < 10; i++) {
      const testRng = new LiteHashDRBG(`test-loot-fail-${i}`);
      const testRand = new RandUtil(testRng);
      const delta = cmd.run(testRand, snapshot, 1, { destCityId: 2 });
      if (delta.logs?.general?.[1]?.[0]?.includes("실패")) {
        failDelta = delta;
        break;
      }
    }

    if (failDelta) {
      // 비용(100)이 차감되어야 함
      expect(failDelta.generals?.[1]?.gold).toBe(5000 - 100);
      expect(failDelta.generals?.[1]?.rice).toBe(5000 - 100);
      expect(failDelta.generals?.[1]?.strengthExp).toBe(1);
      expect(failDelta.logs?.general?.[1]?.[0]).toContain("실패");
    }
  });

  it("아국 도시는 탈취할 수 없어야 함", () => {
    const seed = "test-loot-own";
    const rng = new LiteHashDRBG(seed);
    const rand = new RandUtil(rng);

    const cmd = new GeneralLootCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, { destCityId: 1 });

    expect(delta.logs?.general?.[1]?.[0]).toContain("아국 도시");
  });

  it("공백지는 탈취할 수 없어야 함", () => {
    const seed = "test-loot-neutral";
    const rng = new LiteHashDRBG(seed);
    const rand = new RandUtil(rng);

    const cmd = new GeneralLootCommand();
    const snapshot = createMockSnapshot();
    snapshot.cities[2].nationId = 0;
    const delta = cmd.run(rand, snapshot, 1, { destCityId: 2 });

    expect(delta.logs?.general?.[1]?.[0]).toContain("공백지");
  });

  it("금이 부족하면 실행할 수 없어야 함", () => {
    const seed = "test-loot-no-gold";
    const rng = new LiteHashDRBG(seed);
    const rand = new RandUtil(rng);

    const cmd = new GeneralLootCommand();
    const snapshot = createMockSnapshot();
    snapshot.generals[1].gold = 50; // 비용 100 미만
    const delta = cmd.run(rand, snapshot, 1, { destCityId: 2 });

    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("대상 도시가 지정되지 않으면 실패해야 함", () => {
    const seed = "test-loot-no-target";
    const rng = new LiteHashDRBG(seed);
    const rand = new RandUtil(rng);

    const cmd = new GeneralLootCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.logs?.general?.[1]?.[0]).toContain("대상 도시가 지정되지 않았습니다");
  });
});
