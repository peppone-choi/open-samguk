import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { createMockWorldSnapshot } from "../test-utils.js";
import { GeneralRestCommand } from "./GeneralRestCommand.js";
import { GeneralTrainingCommand } from "./GeneralTrainingCommand.js";
import { GeneralDomesticSkillResetCommand } from "./GeneralSpecialResetCommand.js";

describe("General Commands Parity", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot = createMockWorldSnapshot({
    generals: {
      1: {
        id: 1,
        name: "유비",
        nationId: 1,
        cityId: 1,
        gold: 1000,
        rice: 1000,
        leadership: 7, // 레거시 내부 수치 (70 -> 7)
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
        crew: 1000,
        crewType: 0,
        train: 60,
        atmos: 80,
        age: 20,
        special: "che_경작",
        specAge: 20,
        special2: "None",
        specAge2: 0,
        turnTime: new Date(),
        killTurn: 10,
      },
    },
    nations: {
      1: {
        id: 1,
        name: "촉",
        gold: 10000,
        rice: 10000,
        tech: 100,
        power: 1000,
        level: 1,
      },
    },
    cities: {
      1: {
        id: 1,
        name: "성도",
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 100,
        wall: 100,
      },
    },
    gameTime: { year: 184, month: 1 },
  });

  it("GeneralRestCommand는 상태를 변경하지 않아야 함", () => {
    const cmd = new GeneralRestCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {});
    expect(delta.generals?.[1]).toEqual({});
  });

  it("GeneralTrainingCommand는 훈련도와 경험치를 상승시켜야 함", () => {
    const cmd = new GeneralTrainingCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {});

    // 계산식: round((7 * 100 / 1000) * 30) = round(0.7 * 30) = 21
    const score = Math.round(((7 * 100) / 1000) * 30);
    const expectedTrain = 60 + score;

    expect(delta.generals?.[1]?.train).toBe(expectedTrain);
    expect(delta.generals?.[1]?.experience).toBe(100);
    expect(delta.logs?.general?.[1][0]).toContain("훈련치가");
  });

  it("GeneralDomesticSkillResetCommand는 특기를 초기화해야 함", () => {
    const cmd = new GeneralDomesticSkillResetCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {});

    expect(delta.generals?.[1]?.special).toBe("None");
    expect(delta.generals?.[1]?.specAge).toBe(21);
  });
});
