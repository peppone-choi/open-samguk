import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";
import { NationRewardCommand } from "./NationRewardCommand.js";

describe("NationRewardCommand (TDD Loop)", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: "유비",
        gold: 100,
        nationId: 1,
        cityId: 1,
        rice: 100,
        leadership: 7,
        leadershipExp: 0,
        strength: 7,
        strengthExp: 0,
        intel: 7,
        intelExp: 0,
        politics: 7,
        politicsExp: 0,
        charm: 8,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        officerLevel: 1,
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
      2: {
        id: 2,
        name: "조조",
        gold: 100,
        nationId: 1,
        cityId: 1,
        rice: 100,
        leadership: 8,
        leadershipExp: 0,
        strength: 8,
        strengthExp: 0,
        intel: 8,
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
        gold: 10000,
        rice: 10000,
        tech: 100,
        power: 1000,
        level: 1,
        capitalCityId: 1,
        typeCode: "che_국가",
        meta: {},
      },
    },
    cities: {},
    gameTime: { year: 184, month: 1 },
  };

  it("포상 실행 시 국가 자금이 줄고 대상 장수의 자금이 늘어야 함", () => {
    const cmd = new NationRewardCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {
      destGeneralId: 2,
      amount: 1000,
      isGold: true,
    });

    // 국가 자금 감소 확인
    expect(delta.nations?.[1]?.gold).toBe(9000);
    // 대상 장수 자금 증가 확인
    expect(delta.generals?.[2]?.gold).toBe(1100);
    // 로그 확인
    expect(delta.logs?.general?.[1][0]).toContain("수여했습니다");
    expect(delta.logs?.general?.[2][0]).toContain("포상으로 받았습니다");
  });
});
