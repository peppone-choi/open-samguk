import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { createMockWorldSnapshot } from "../test-utils.js";
import { GeneralWarCommand } from "./GeneralWarCommand.js";

describe("GeneralWarCommand", () => {
  const seed = "test-war-seed";
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot = createMockWorldSnapshot({
    generals: {
      1: {
        id: 1,
        name: "조조",
        nationId: 1,
        cityId: 2,
        gold: 1000,
        rice: 1000,
        leadership: 90,
        strength: 80,
        intel: 90,
        politics: 90,
        charm: 90,
        crew: 10000,
        train: 100,
        atmos: 100,
        age: 30,
      },
      2: {
        id: 2,
        name: "유비",
        nationId: 2,
        cityId: 10,
        gold: 1000,
        rice: 1000,
        leadership: 80,
        strength: 80,
        intel: 80,
        politics: 80,
        charm: 90,
        crew: 5000,
        train: 80,
        atmos: 100,
        age: 30,
      },
    },
    nations: {
      1: {
        id: 1,
        name: "위",
        chiefGeneralId: 1,
        capitalCityId: 2,
        typeCode: "che_중립",
      },
      2: {
        id: 2,
        name: "촉",
        chiefGeneralId: 2,
        capitalCityId: 10,
        typeCode: "che_중립",
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
      },
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
      },
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
      },
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
      },
    },
    gameTime: { year: 190, month: 1 },
  });

  it("인접한 적국 도시를 공격하면 전투가 발생해야 함", () => {
    const cmd = new GeneralWarCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 10 });

    expect(delta.logs?.general?.[1][0]).toContain("공격");
    expect(delta.cities?.[10]?.def).toBeLessThan(500);
  });

  it("인접하지 않은 도시를 공격하면 실패해야 함", () => {
    const cmd = new GeneralWarCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 50 });

    expect(delta.logs?.general?.[1][0]).toContain("출격 실패: 인접한 도시가 아닙니다.");
  });

  it("자국 도시를 공격하면 실패해야 함", () => {
    const cmd = new GeneralWarCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 19 });

    expect(delta.logs?.general?.[1][0]).toContain("출격 실패: 자국 도시는 공격할 수 없습니다.");
  });
});
