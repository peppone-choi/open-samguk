import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralTalentSearchCommand } from "./GeneralTalentSearchCommand.js";

describe("GeneralTalentSearchCommand (TDD Loop)", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: "유비",
        nationId: 1,
        cityId: 1,
        gold: 100,
        rice: 100,
        leadership: 7,
        leadershipExp: 0,
        strength: 7,
        strengthExp: 0,
        intel: 7,
        intelExp: 0,
        politics: 8,
        politicsExp: 0,
        charm: 9,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        officerLevel: 0,
        recentWar: 0,
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
        killTurn: 10,
        meta: {},
      },
    },
    nations: {
      1: {
        id: 1,
        name: "촉",
        color: "#ff0000",
        capitalCityId: 1,
        gold: 10000,
        rice: 10000,
        tech: 100,
        power: 1000,
        level: 1,
        typeCode: "normal",
        meta: {},
      },
    },
    cities: {
      1: {
        id: 1,
        name: "평원",
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 100,
        wall: 100,
        meta: {},
      },
    },
    gameTime: { year: 184, month: 1 },
  };

  it("인재 탐색 시 금을 발견하거나 장수를 찾아야 함 (결정론적 검증)", () => {
    const cmd = new GeneralTalentSearchCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {});

    // 결과는 RNG에 따라 다르지만, delta가 생성되어야 함
    expect(delta.generals?.[1]).toBeDefined();
    expect(delta.logs?.general?.[1][0]).toMatch(/발견|찾았습니다/);
  });
});
