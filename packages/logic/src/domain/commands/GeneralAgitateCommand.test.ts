import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralAgitateCommand } from "./GeneralAgitateCommand.js";

describe("GeneralAgitateCommand", () => {
  const seed = "test-agitate-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: "제갈량",
        nationId: 1,
        cityId: 1, // 업
        gold: 10000,
        rice: 10000,
        leadership: 50,
        leadershipExp: 0,
        strength: 50,
        strengthExp: 0,
        intel: 100,
        intelExp: 0,
        politics: 50,
        politicsExp: 0,
        charm: 50,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        crew: 0,
        crewType: 0,
        train: 0,
        atmos: 0,
        age: 20,
        special: "None",
        specAge: 0,
        special2: "None",
        specAge2: 0,
        turnTime: new Date(),
        killTurn: 0,
        meta: {},
        penalty: {},
        officerLevel: 0,
        officerCity: 0,
        ownerId: 0,
        bornYear: 0,
        deadYear: 0,
        weapon: "",
        book: "",
        horse: "",
        item: "",
        recentWarTime: null,
        makeLimit: 0,
        block: 0,
        recentWar: 0,
      },
      2: {
        id: 2,
        name: "바보",
        nationId: 2, // 적국
        cityId: 2, // 허창
        gold: 0,
        rice: 0,
        intel: 10,
        intelExp: 0,
        leadership: 50,
        leadershipExp: 0,
        strength: 50,
        strengthExp: 0,
        politics: 50,
        politicsExp: 0,
        charm: 50,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        crew: 0,
        crewType: 0,
        train: 0,
        atmos: 0,
        age: 20,
        special: "None",
        specAge: 0,
        special2: "None",
        specAge2: 0,
        turnTime: new Date(),
        killTurn: 0,
        meta: {},
        penalty: {},
        officerLevel: 0,
        officerCity: 0,
        ownerId: 0,
        bornYear: 0,
        deadYear: 0,
        weapon: "",
        book: "",
        horse: "",
        item: "",
        recentWarTime: null,
        makeLimit: 0,
        block: 0,
        recentWar: 0,
      },
    },
    nations: {
      1: {
        id: 1,
        name: "촉",
        color: "",
        capitalCityId: 1,
        gold: 0,
        rice: 0,
        bill: 0,
        rate: 0,
        rateTmp: 0,
        secretLimit: 0,
        chiefGeneralId: 1,
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 0,
        surrenderLimit: 0,
        tech: 0,
        power: 0,
        level: 0,
        typeCode: "",
        spy: {},
        meta: {},
      },
      2: {
        id: 2,
        name: "위",
        color: "",
        capitalCityId: 2,
        gold: 0,
        rice: 0,
        bill: 0,
        rate: 0,
        rateTmp: 0,
        secretLimit: 0,
        chiefGeneralId: 2,
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 0,
        surrenderLimit: 0,
        tech: 0,
        power: 0,
        level: 0,
        typeCode: "",
        spy: {},
        meta: {},
      },
    },
    cities: {
      1: {
        id: 1,
        name: "업",
        nationId: 1,
        supply: 1,
        pop: 1000,
        popMax: 1000,
        agri: 1000,
        agriMax: 1000,
        comm: 1000,
        commMax: 1000,
        secu: 100,
        secuMax: 100,
        def: 100,
        defMax: 100,
        wall: 100,
        wallMax: 100,
        trust: 100,
        gold: 0,
        rice: 0,
        region: 1,
        state: 0,
        term: 0,
        conflict: {},
        meta: {},
        level: 1,
        front: 0,
      },
      2: {
        id: 2,
        name: "허창",
        nationId: 2,
        supply: 1,
        pop: 10000,
        popMax: 10000,
        agri: 1000,
        agriMax: 1000,
        comm: 1000,
        commMax: 1000,
        secu: 100,
        secuMax: 100,
        def: 100,
        defMax: 100,
        wall: 100,
        wallMax: 100,
        trust: 100,
        gold: 0,
        rice: 0,
        region: 1,
        state: 0,
        term: 0,
        conflict: {},
        meta: {},
        level: 1,
        front: 0,
      },
    },
    diplomacy: {},
    troops: {},
    gameTime: { year: 184, month: 1 },
    env: { develcost: 20 },
  };

  it("인접한 적국 도시에 선동을 시도해야 함", () => {
    const cmd = new GeneralAgitateCommand();
    // 업(1) -> 허창(2). MapData상 거리 2.
    // wait, MapData says [1, '업', ... ['남피', '복양', '호관', '계교', '관도']]
    // [2, '허창', ... ['완', '진류', '초', '호로', '사수', '관도']]
    // They share '관도'. But are they adjacent?
    // MapData.ts says:
    // 1: ['남피', '복양', '호관', '계교', '관도'] (IDs: 9, 18, 70, 78, 80)
    // 2: ['완', '진류', '초', '호로', '사수', '관도'] (IDs: 10, 19, 38, 71, 74, 80)
    // They are NOT directly connected in RAW_CITIES.
    // However, ConstraintHelper uses MapUtil.areAdjacent.
    // If MapUtil says no, this test should fail with "NearCity" constraint.

    // Let's force adjacency by modifying connections in snapshot?
    // No, MapUtil uses static data.
    // I should pick a pair that IS connected.
    // 1(업) <-> 18(복양)

    // Let's modify the snapshot to include city 18 as enemy.
    const snapshotWithConnected = JSON.parse(JSON.stringify(mockSnapshot));
    snapshotWithConnected.cities[18] = {
      ...snapshotWithConnected.cities[2],
      id: 18,
      name: "복양",
      nationId: 2,
    };
    snapshotWithConnected.generals[1].turnTime = new Date(); // Date recovery

    const delta = cmd.run(rand, snapshotWithConnected, 1, { destCityId: 18 });

    const logs = delta.logs?.general?.[1] || [];
    const isSuccess = logs.some((l) => l.includes("선동하여"));
    const isFail = logs.some((l) => l.includes("실패"));

    expect(isSuccess || isFail).toBe(true);

    if (isSuccess) {
      expect(delta.cities?.[18]?.secu).toBeLessThan(100);
    }
  });
});
