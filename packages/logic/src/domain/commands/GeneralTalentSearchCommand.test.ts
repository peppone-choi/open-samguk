import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { createMockWorldSnapshot } from "../test-utils.js";
import { GeneralTalentSearchCommand } from "./GeneralTalentSearchCommand.js";

describe("GeneralTalentSearchCommand (TDD Loop)", () => {
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
        gold: 100,
        rice: 100,
        leadership: 7,
        strength: 7,
        intel: 7,
        politics: 8,
        charm: 9,
        killTurn: 10,
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
      },
    },
    gameTime: { year: 184, month: 1 },
  });

  it("인재 탐색 시 금을 발견하거나 장수를 찾아야 함 (결정론적 검증)", () => {
    const cmd = new GeneralTalentSearchCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {});

    // 결과는 RNG에 따라 다르지만, delta가 생성되어야 함
    expect(delta.generals?.[1]).toBeDefined();
    expect(delta.logs?.general?.[1][0]).toMatch(/발견|찾았습니다/);
  });
});
