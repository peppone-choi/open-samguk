import { describe, it, expect } from "vitest";
import { CheckNationNameDuplicateConstraint } from "./CheckNationNameDuplicateConstraint.js";
import { ExistsAllowJoinNationConstraint } from "./ExistsAllowJoinNationConstraint.js";
import { Nation } from "../entities.js";

describe("NameAndJoinConstraints", () => {
    describe("CheckNationNameDuplicateConstraint", () => {
        const nations = {
            1: { id: 1, name: "촉" },
            2: { id: 2, name: "오" },
        };

        it("중복되지 않은 이름이면 허용해야 함", () => {
            const constraint = new CheckNationNameDuplicateConstraint("위");
            expect(constraint.checkDuplicate(nations, 1).kind).toBe("allow");
        });

        it("본인 국가는 중복 체크에서 제외해야 함", () => {
            const constraint = new CheckNationNameDuplicateConstraint("촉");
            expect(constraint.checkDuplicate(nations, 1).kind).toBe("allow");
        });

        it("타국과 이름이 겹치면 거절해야 함", () => {
            const constraint = new CheckNationNameDuplicateConstraint("오");
            expect(constraint.checkDuplicate(nations, 1).kind).toBe("deny");
        });
    });

    describe("ExistsAllowJoinNationConstraint", () => {
        const mockNation = (id: number, scout: number, gennum: number): Nation => ({
            id, name: `N${id}`, color: "", chiefGeneralId: 0, capitalCityId: 0, gold: 0, rice: 0, rate: 0, rateTmp: 0, tech: 0, power: 0, level: 1, gennum, typeCode: "", scoutLevel: scout, strategicCmdLimit: 0, surrenderLimit: 0, spy: {}, aux: {}, meta: {}, warState: 0
        });

        it("임관 가능한 국가가 있으면 허용해야 함", () => {
            const nations = {
                1: mockNation(1, 0, 5), // 가능
            };
            const constraint = new ExistsAllowJoinNationConstraint(5, []);
            expect(constraint.checkExists(nations).kind).toBe("allow");
        });

        it("모든 국가가 임관 거부 상태면 거절해야 함", () => {
            const nations = {
                1: mockNation(1, 1, 5),
            };
            const constraint = new ExistsAllowJoinNationConstraint(5, []);
            expect(constraint.checkExists(nations).kind).toBe("deny");
        });

        it("인원 제한에 걸리면 거절해야 함 (초반)", () => {
            const nations = {
                1: mockNation(1, 0, 15), // 초기 제한 10명 초과
            };
            const constraint = new ExistsAllowJoinNationConstraint(1, []);
            expect(constraint.checkExists(nations).kind).toBe("deny");
        });

        it("제외 목록에 있는 국가는 무시해야 함", () => {
            const nations = {
                1: mockNation(1, 0, 5),
            };
            const constraint = new ExistsAllowJoinNationConstraint(5, [1]);
            expect(constraint.checkExists(nations).kind).toBe("deny");
        });
    });
});
