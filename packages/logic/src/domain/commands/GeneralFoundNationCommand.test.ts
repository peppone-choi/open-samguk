import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import {
  createMockWorldSnapshot,
  createMockGeneral,
  createMockNation,
  createMockCity,
} from "../test-utils.js";
import type { WorldSnapshot } from "../entities.js";
import { GeneralFoundNationCommand } from "./GeneralFoundNationCommand.js";

describe("GeneralFoundNationCommand", () => {
  const seed = "test-found-seed";
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
        intel: 80,
        leadership: 80,
        strength: 80,
        politics: 80,
        charm: 99,
        officerLevel: 12,
      },
      2: {
        id: 2,
        name: "관우",
        nationId: 1,
        cityId: 1,
        officerLevel: 0,
      },
    },
    nations: {
      1: {
        id: 1,
        name: "유비군",
        level: 0,
        chiefGeneralId: 1,
        capitalCityId: 0,
        typeCode: "che_중립",
        gennum: 2,
      },
    },
    cities: {
      1: {
        id: 1,
        name: "평원",
        nationId: 1,
        level: 5,
        pop: 1000,
        agri: 1000,
        comm: 1000,
        secu: 100,
        def: 100,
        wall: 100,
        trust: 100,
      },
    },
  });

  it("방랑군 군주가 건국을 실행하면 국가가 정식 국가가 되어야 함", () => {
    const cmd = new GeneralFoundNationCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {
      nationName: "촉한",
      colorType: "#F00",
      nationType: "che_덕가",
    });

    expect(delta.nations?.[1]?.name).toBe("촉한");
    expect(delta.nations?.[1]?.level).toBe(1);
    expect(delta.logs?.global?.[0]).toContain("건국하였습니다");
  });

  it("장수가 1명이면 건국할 수 없음", () => {
    const soloSnapshot: WorldSnapshot = JSON.parse(JSON.stringify(mockSnapshot));
    soloSnapshot.generals[1].turnTime = new Date();
    delete soloSnapshot.generals[2];
    soloSnapshot.nations[1].gennum = 1;

    const cmd = new GeneralFoundNationCommand();
    const delta = cmd.run(rand, soloSnapshot, 1, {
      nationName: "실패국",
      colorType: "#F00",
      nationType: "che_덕가",
    });

    expect(delta.logs?.general?.[1][0]).toContain("수하 장수가 2명 이상이어야 합니다");
  });

  it("이미 정식 국가이면 실패해야 함", () => {
    const formalSnapshot: WorldSnapshot = JSON.parse(JSON.stringify(mockSnapshot));
    formalSnapshot.generals[1].turnTime = new Date();
    formalSnapshot.generals[2].turnTime = new Date();
    formalSnapshot.nations[1].level = 1;

    const cmd = new GeneralFoundNationCommand();
    const delta = cmd.run(rand, formalSnapshot, 1, {
      nationName: "실패국",
      colorType: "#F00",
      nationType: "che_덕가",
    });

    expect(delta.logs?.general?.[1][0]).toContain("방랑군 상태여야 합니다");
  });
});
