import { describe, it, expect } from "vitest";
import { AdhocCallbackConstraint } from "./AdhocCallbackConstraint.js";
import { AvailableRecruitCrewTypeConstraint } from "./AvailableRecruitCrewTypeConstraint.js";

describe("OtherConstraints", () => {
    describe("AdhocCallbackConstraint", () => {
        it("콜백이 null을 반환하면 허용해야 함", () => {
            const constraint = new AdhocCallbackConstraint(() => null);
            expect(constraint.test({} as any, {} as any).kind).toBe("allow");
        });

        it("콜백이 문자열을 반환하면 거절해야 함", () => {
            const constraint = new AdhocCallbackConstraint(() => "이유");
            const result = constraint.test({} as any, {} as any);
            expect(result.kind).toBe("deny");
            if (result.kind === "deny") {
                expect(result.reason).toBe("이유");
            }
        });
    });

    describe("AvailableRecruitCrewTypeConstraint", () => {
        it("현재는 무조건 허용해야 함", () => {
            const constraint = new AvailableRecruitCrewTypeConstraint(1);
            expect(constraint.test({} as any, {} as any).kind).toBe("allow");
        });
    });
});
