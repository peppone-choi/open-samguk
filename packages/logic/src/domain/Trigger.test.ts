import { describe, it, expect, vi } from "vitest";
import {
  TriggerRegistry,
  Trigger,
  TriggerContext,
  TriggerPriority,
} from "./Trigger.js";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";

describe("Trigger System (TDD)", () => {
  const createContext = (): TriggerContext => ({
    actorId: 1,
    snapshot: {
      generals: {},
      nations: {},
      cities: {},
      diplomacy: {},
      troops: {},
      messages: {},
      gameTime: { year: 1, month: 1 },
      env: {},
    },
    rand: new RandUtil(new LiteHashDRBG("test")),
    env: {},
  });

  it("트리거는 우선순위에 따라 실행되어야 함", () => {
    const registry = new TriggerRegistry();
    const results: string[] = [];

    const t1: Trigger = {
      name: "Late",
      priority: 100,
      attempt: () => true,
      execute: () => {
        results.push("Late");
        return { delta: {}, continueExecution: true };
      },
    };

    const t2: Trigger = {
      name: "Early",
      priority: 10,
      attempt: () => true,
      execute: () => {
        results.push("Early");
        return { delta: {}, continueExecution: true };
      },
    };

    registry.register(t1);
    registry.register(t2);

    registry.runAll(createContext());

    expect(results).toEqual(["Early", "Late"]);
  });

  it("attempt가 false를 반환하면 execute는 실행되지 않아야 함", () => {
    const registry = new TriggerRegistry();
    const executeSpy = vi
      .fn()
      .mockReturnValue({ delta: {}, continueExecution: true });

    const t: Trigger = {
      name: "FailedAttempt",
      priority: 1,
      attempt: () => false,
      execute: executeSpy,
    };

    registry.register(t);
    registry.runAll(createContext());

    expect(executeSpy).not.toHaveBeenCalled();
  });

  it("TriggerPriority 상수 값이 올바르게 정의되어야 함", () => {
    expect(TriggerPriority.MIN).toBe(0);
    expect(TriggerPriority.BEGIN).toBe(10000);
    expect(TriggerPriority.PRE).toBe(20000);
    expect(TriggerPriority.BODY).toBe(30000);
    expect(TriggerPriority.POST).toBe(40000);
    expect(TriggerPriority.FINAL).toBe(50000);
  });

  it("registerMany로 다수 트리거를 한 번에 등록할 수 있어야 함", () => {
    const registry = new TriggerRegistry();
    const results: string[] = [];

    const triggers: Trigger[] = [
      {
        name: "C",
        priority: 30,
        attempt: () => true,
        execute: () => {
          results.push("C");
          return { delta: {}, continueExecution: true };
        },
      },
      {
        name: "A",
        priority: 10,
        attempt: () => true,
        execute: () => {
          results.push("A");
          return { delta: {}, continueExecution: true };
        },
      },
      {
        name: "B",
        priority: 20,
        attempt: () => true,
        execute: () => {
          results.push("B");
          return { delta: {}, continueExecution: true };
        },
      },
    ];

    registry.registerMany(...triggers);

    expect(registry.getTriggers().map((t) => t.name)).toEqual(["A", "B", "C"]);

    registry.runAll(createContext());
    expect(results).toEqual(["A", "B", "C"]);
  });

  it("merge로 레지스트리를 병합할 수 있어야 함", () => {
    const registry1 = new TriggerRegistry();
    const registry2 = new TriggerRegistry();
    const results: string[] = [];

    registry1.register({
      name: "A",
      priority: 10,
      attempt: () => true,
      execute: () => {
        results.push("A");
        return { delta: {}, continueExecution: true };
      },
    });
    registry1.register({
      name: "C",
      priority: 30,
      attempt: () => true,
      execute: () => {
        results.push("C");
        return { delta: {}, continueExecution: true };
      },
    });

    registry2.register({
      name: "B",
      priority: 20,
      attempt: () => true,
      execute: () => {
        results.push("B");
        return { delta: {}, continueExecution: true };
      },
    });

    registry1.merge(registry2);

    registry1.runAll(createContext());
    expect(results).toEqual(["A", "B", "C"]);
  });

  it("clear로 모든 트리거를 제거할 수 있어야 함", () => {
    const registry = new TriggerRegistry();

    registry.register({
      name: "Test",
      priority: 1,
      attempt: () => true,
      execute: () => ({ delta: {}, continueExecution: true }),
    });
    expect(registry.isEmpty()).toBe(false);

    registry.clear();
    expect(registry.isEmpty()).toBe(true);
    expect(registry.getTriggers()).toEqual([]);
  });

  it("continueExecution이 false면 다음 트리거가 실행되지 않아야 함 (cascade control)", () => {
    const registry = new TriggerRegistry();
    const results: string[] = [];

    registry.registerMany(
      {
        name: "First",
        priority: 10,
        attempt: () => true,
        execute: () => {
          results.push("First");
          return { delta: {}, continueExecution: true };
        },
      },
      {
        name: "Stopper",
        priority: 20,
        attempt: () => true,
        execute: () => {
          results.push("Stopper");
          return { delta: {}, continueExecution: false };
        },
      },
      {
        name: "Never",
        priority: 30,
        attempt: () => true,
        execute: () => {
          results.push("Never");
          return { delta: {}, continueExecution: true };
        },
      },
    );

    registry.runAll(createContext());
    expect(results).toEqual(["First", "Stopper"]);
  });

  it("env를 통해 트리거 간 상태 공유가 가능해야 함", () => {
    const registry = new TriggerRegistry();
    const ctx = createContext();

    registry.registerMany(
      {
        name: "Setter",
        priority: 10,
        attempt: () => true,
        execute: (c) => {
          c.env["value"] = 42;
          return { delta: {}, continueExecution: true };
        },
      },
      {
        name: "Reader",
        priority: 20,
        attempt: (c) => c.env["value"] === 42,
        execute: () => ({
          delta: { env: { read: true } },
          continueExecution: true,
        }),
      },
    );

    const deltas = registry.runAll(ctx);
    expect(ctx.env["value"]).toBe(42);
    expect(deltas).toHaveLength(2);
  });
});
