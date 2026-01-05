import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";
import { GeneralMoveCommand } from "./GeneralMoveCommand.js";

describe("GeneralMoveCommand (TDD)", () => {
  const seed = "test-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: "유비",
        nationId: 1,
        cityId: 1, // 업
        gold: 1000,
        rice: 1000,
        leadership: 7,
        leadershipExp: 0,
        strength: 7,
        strengthExp: 0,
        intel: 7,
        intelExp: 0,
        politics: 8,
        politicsExp: 0,
        charm: 8,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        crew: 0,
        crewType: 0,
        train: 0,
        atmos: 100,
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
    nations: {},
    cities: {
      1: {
        id: 1,
        name: "업",
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 100,
        wall: 100,
        meta: {},
      },
      9: {
        id: 9,
        name: "남피",
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 100,
        wall: 100,
        meta: {},
      },
      2: {
        id: 2,
        name: "허창",
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

  it("인접한 도시로 이동 시 장수의 위치가 변경되어야 함", () => {
    const cmd = new GeneralMoveCommand();
    // 업(1) -> 남피(9)는 인접함
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 9 });

    expect(delta.generals?.[1]?.cityId).toBe(9);
    expect(delta.generals?.[1]?.atmos).toBeLessThan(100);
    expect(delta.logs?.general?.[1][0]).toContain("남피(으)로 이동했습니다.");
  });

  it("인접하지 않은 도시로 이동 시 실패해야 함", () => {
    const cmd = new GeneralMoveCommand();
    // 업(1) -> 허창(2)는 인접하지 않음 (관도 등을 거쳐야 함)
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 2 });

    expect(delta.generals?.[1]).toBeUndefined();
    expect(delta.logs?.general?.[1][0]).toContain(
      "이동 실패: 인접한 도시가 아닙니다.",
    );
  });
});
