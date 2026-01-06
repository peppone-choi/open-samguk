import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralWarCommand } from "./GeneralWarCommand.js";

describe("GeneralWarCommand", () => {
  const seed = "test-war-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: "조조",
        nationId: 1,
        cityId: 2, // 허창
        gold: 1000,
        rice: 1000,
        leadership: 90,
        leadershipExp: 0,
        strength: 80,
        strengthExp: 0,
        intel: 90,
        intelExp: 0,
        politics: 90,
        politicsExp: 0,
        charm: 90,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        crew: 10000,
        crewType: 0,
        train: 100,
        atmos: 100,
        age: 30,
        special: "None",
        specAge: 0,
        special2: "None",
        specAge2: 0,
        turnTime: new Date(),
        killTurn: 10,
        meta: {},
      },
      2: {
        id: 2,
        name: "유비",
        nationId: 2,
        cityId: 10, // 완 (허창과 인접)
        gold: 1000,
        rice: 1000,
        leadership: 80,
        leadershipExp: 0,
        strength: 80,
        strengthExp: 0,
        intel: 80,
        intelExp: 0,
        politics: 80,
        politicsExp: 0,
        charm: 90,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        crew: 5000,
        crewType: 0,
        train: 80,
        atmos: 100,
        age: 30,
        special: "None",
        specAge: 0,
        special2: "None",
        specAge2: 0,
        turnTime: new Date(),
        killTurn: 10,
        meta: {},
      },
    },
    nations: {
      1: {
        id: 1,
        name: "위",
        color: "#000",
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
        type: "che_중립",
        spy: {},
        meta: {},
      },
      2: {
        id: 2,
        name: "촉",
        color: "#000",
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
        type: "che_중립",
        spy: {},
        meta: {},
      },
    },
    cities: {
      2: {
        id: 2,
        name: "허창",
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 1000,
        wall: 1000,
        meta: {},
      },
      10: {
        id: 10,
        name: "완",
        nationId: 2,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 500,
        wall: 500,
        meta: {},
      }, // 허창과 인접
      1: {
        id: 1,
        name: "업",
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 1000,
        wall: 1000,
        meta: {},
      }, // 허창과 인접하지 않음 (이 테스트 데이터셋 상에서는 연결 정의를 확인해야 함, 실제 MapData.ts에는 연결됨. 하지만 ConstraintHelper는 MapData.ts를 쓴다.)
      19: {
        id: 19,
        name: "진류",
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 1000,
        wall: 1000,
        meta: {},
      }, // 허창과 인접, 같은 국가
      50: {
        id: 50,
        name: "교지",
        nationId: 2,
        pop: 5000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 1000,
        wall: 1000,
        meta: {},
      }, // 아주 먼 곳
    },
    gameTime: { year: 190, month: 1 },
  };

  it("인접한 적국 도시를 공격하면 전투가 발생해야 함", () => {
    const cmd = new GeneralWarCommand();
    // 조조(허창, 1) -> 완(10, 2) 공격. 완은 허창과 인접함 (MapData 참조)
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 10 });

    expect(delta.logs?.general?.[1][0]).toContain("공격했습니다");
    expect(delta.cities?.[10]?.def).toBeLessThan(500); // 수비 감소 확인
  });

  it("인접하지 않은 도시를 공격하면 실패해야 함", () => {
    const cmd = new GeneralWarCommand();
    // 조조(허창, 1) -> 교지(50, 2) 공격. 인접하지 않음.
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 50 });

    expect(delta.logs?.general?.[1][0]).toContain(
      "출격 실패: 인접한 도시가 아닙니다.",
    );
  });

  it("자국 도시를 공격하면 실패해야 함", () => {
    const cmd = new GeneralWarCommand();
    // 조조(허창, 1) -> 진류(19, 1) 공격. 같은 국가.
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 19 });

    expect(delta.logs?.general?.[1][0]).toContain(
      "출격 실패: 자국 도시는 공격할 수 없습니다.",
    );
  });
});
