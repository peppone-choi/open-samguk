import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralHardTrainingCommand } from "./GeneralHardTrainingCommand.js";
import { GameConst } from "../GameConst.js";

describe("GeneralHardTrainingCommand", () => {
  const seed = "test-hard-training-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const createMockSnapshot = (
    overrides: Partial<WorldSnapshot["generals"][number]> = {}
  ): WorldSnapshot => ({
    generals: {
      1: {
        id: 1,
        name: "장수1",
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
        dex: { 1: 100 },
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
        ...overrides,
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
        aux: {},
        chiefGeneralId: 1,
      },
    },
    cities: {
      1: {
        id: 1,
        name: "도시1",
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
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 184, month: 1 },
    env: {},
    generalTurns: {},
  });

  it("정상 실행 시 훈련/사기/통솔경험/숙련도가 증가해야 함", () => {
    const cmd = new GeneralHardTrainingCommand();
    // crew를 높게 설정하여 score가 상한에 걸리지 않도록 함
    const snapshot = createMockSnapshot({ crew: 5000 });
    const delta = cmd.run(rand, snapshot, 1, {});

    // 훈련/사기 상승 계산: leadership(80) * 100 / crew(5000) * trainDelta(30) * 2/3 = 32
    const expectedScore = Math.round((((80 * 100) / 5000) * 30 * 2) / 3);

    expect(delta.generals?.[1]?.train).toBe(50 + expectedScore);
    expect(delta.generals?.[1]?.atmos).toBe(50 + expectedScore);
    expect(delta.generals?.[1]?.experience).toBe(1000 + 150);
    expect(delta.generals?.[1]?.dedication).toBe(1000 + 100);
    expect(delta.generals?.[1]?.leadershipExp).toBe(1);
    expect(delta.generals?.[1]?.rice).toBe(5000 - 500);
    expect(delta.generals?.[1]?.dex?.[1]).toBe(100 + expectedScore * 2);
    expect(delta.logs?.general?.[1]?.[0]).toContain("상승했습니다");
  });

  it("병사가 없으면 실패해야 함", () => {
    const cmd = new GeneralHardTrainingCommand();
    const snapshot = createMockSnapshot({ crew: 0 });
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("군량이 부족하면 실패해야 함", () => {
    const cmd = new GeneralHardTrainingCommand();
    const snapshot = createMockSnapshot({ rice: 100 });
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("훈련도가 최대치에 도달하면 실패해야 함", () => {
    const cmd = new GeneralHardTrainingCommand();
    const snapshot = createMockSnapshot({ train: GameConst.maxTrainByCommand });
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("중립 세력은 실행할 수 없어야 함", () => {
    const cmd = new GeneralHardTrainingCommand();
    const snapshot = createMockSnapshot({ nationId: 0 });
    snapshot.nations[0] = { ...snapshot.nations[1], id: 0, level: 0 };
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals).toBeUndefined();
    expect(delta.logs?.general?.[1]?.[0]).toContain("실패");
  });

  it("훈련도가 최대치를 초과하지 않아야 함", () => {
    const cmd = new GeneralHardTrainingCommand();
    const snapshot = createMockSnapshot({ train: 95 });
    const delta = cmd.run(rand, snapshot, 1, {});

    expect(delta.generals?.[1]?.train).toBeLessThanOrEqual(GameConst.maxTrainByCommand);
  });
});
