import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralBorderReturnCommand } from "./GeneralBorderReturnCommand.js";

describe("GeneralBorderReturnCommand", () => {
  const seed = "test-border-return-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const createMockSnapshot = (): WorldSnapshot => ({
    generals: {
      1: {
        id: 1,
        name: "장수1",
        nationId: 1,
        cityId: 2, // 적진에 위치
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
      },
    },
    nations: {
      1: {
        id: 1,
        name: "국가1",
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
        typeCode: "che_중립",
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 36,
        surrenderLimit: 72,
        spy: {},
        meta: {},
        chiefGeneralId: 1,
      },
      2: {
        id: 2,
        name: "적국",
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
        typeCode: "che_중립",
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 36,
        surrenderLimit: 72,
        spy: {},
        meta: {},
        chiefGeneralId: 2,
      },
    },
    cities: {
      1: {
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
      2: {
        // 적진 (허창) - 업과 연결됨
        id: 2,
        name: "허창",
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
        gold: 0,
        rice: 0,
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
  });

  it("적진에서 가장 가까운 아국 도시로 귀환해야 함", () => {
    const cmd = new GeneralBorderReturnCommand();
    const snapshot = createMockSnapshot();
    const delta = cmd.run(rand, snapshot, 1, {});

    // 허창(2)에서 업(1)으로 귀환
    expect(delta.generals?.[1]?.cityId).toBeDefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("접경귀환했습니다");
  });

  it("아국 도시에서는 실행할 수 없어야 함", () => {
    const cmd = new GeneralBorderReturnCommand();
    const snapshot = createMockSnapshot();
    snapshot.generals[1].cityId = 1; // 아국 도시로 변경
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("중립 세력은 실행할 수 없어야 함", () => {
    const cmd = new GeneralBorderReturnCommand();
    const snapshot = createMockSnapshot();
    snapshot.generals[1].nationId = 0;
    snapshot.nations[0] = { ...snapshot.nations[1], id: 0, level: 0 };
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("3칸 이내에 아국 도시가 없으면 실패해야 함", () => {
    const cmd = new GeneralBorderReturnCommand();
    const snapshot = createMockSnapshot();
    // 모든 도시를 적국 소유로 변경
    snapshot.cities[1].nationId = 2;
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain(
      "3칸 이내에 아국 도시가 없습니다",
    );
  });

  it("보급 안되는 도시는 제외해야 함", () => {
    const cmd = new GeneralBorderReturnCommand();
    const snapshot = createMockSnapshot();
    snapshot.cities[1].supply = 0; // 보급 단절
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.logs?.general?.[1]?.[0]).toContain(
      "3칸 이내에 아국 도시가 없습니다",
    );
  });
});
