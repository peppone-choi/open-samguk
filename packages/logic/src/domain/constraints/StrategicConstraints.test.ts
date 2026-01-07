import { describe, it, expect } from "vitest";
import { AllowStrategicCommandConstraint } from "./AllowStrategicCommandConstraint.js";
import { AvailableStrategicCommandConstraint } from "./AvailableStrategicCommandConstraint.js";
import { Nation } from "../entities.js";
import { SnapshotStateView } from "../Command.js";

describe("StrategicConstraints", () => {
  const mockNation = (id: number, overrides: Partial<Nation> = {}): Nation => ({
    id,
    name: `N${id}`,
    color: "",
    chiefGeneralId: 0,
    capitalCityId: 0,
    gold: 0,
    rice: 0,
    rate: 0,
    rateTmp: 0,
    tech: 0,
    power: 0,
    level: 1,
    gennum: 0,
    typeCode: "",
    scoutLevel: 0,
    strategicCmdLimit: 0,
    surrenderLimit: 0,
    spy: {},
    aux: {},
    meta: {},
    warState: 0,
    ...overrides,
  });

  describe("AllowStrategicCommandConstraint", () => {
    it("전쟁 금지 상태가 아니면 허용해야 함", () => {
      const constraint = new AllowStrategicCommandConstraint();
      const nation = mockNation(1, { warState: 0 });
      const view = new SnapshotStateView({ nations: { 1: nation } } as any);
      expect(constraint.test({ nationId: 1 } as any, view).kind).toBe("allow");
    });

    it("전쟁 금지 상태이면 거절해야 함", () => {
      const constraint = new AllowStrategicCommandConstraint();
      const nation = mockNation(1, { warState: 1 });
      const view = new SnapshotStateView({ nations: { 1: nation } } as any);
      expect(constraint.test({ nationId: 1 } as any, view).kind).toBe("deny");
    });
  });

  describe("AvailableStrategicCommandConstraint", () => {
    it("전략 기한이 지났으면 허용해야 함", () => {
      const constraint = new AvailableStrategicCommandConstraint(10);
      const nation = mockNation(1, { strategicCmdLimit: 5 });
      const view = new SnapshotStateView({ nations: { 1: nation } } as any);
      expect(constraint.test({ nationId: 1 } as any, view).kind).toBe("allow");
    });

    it("전략 기한이 남았으면 거절해야 함", () => {
      const constraint = new AvailableStrategicCommandConstraint(10);
      const nation = mockNation(1, { strategicCmdLimit: 15 });
      const view = new SnapshotStateView({ nations: { 1: nation } } as any);
      expect(constraint.test({ nationId: 1 } as any, view).kind).toBe("deny");
    });
  });
});
