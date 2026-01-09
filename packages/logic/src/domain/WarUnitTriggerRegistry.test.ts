import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo/common";
import {
  WarUnitTriggerRegistry,
  WarUnitTrigger,
  WarUnitTriggerContext,
  RaiseType,
  TriggerPriority,
} from "./WarUnitTriggerRegistry.js";
import { WarUnitGeneral } from "./WarUnitGeneral.js";
import type { General } from "./entities.js";
import { KillingBlowAttemptTrigger } from "./triggers/war/KillingBlowAttemptTrigger.js";
import { KillingBlowActivateTrigger } from "./triggers/war/KillingBlowActivateTrigger.js";

// 테스트용 장수 생성 헬퍼
const createMockGeneral = (id: number, name: string): General => ({
  id,
  name,
  ownerId: 1,
  nationId: 1,
  cityId: 1,
  troopId: 0,
  gold: 1000,
  rice: 1000,
  leadership: 70,
  leadershipExp: 0,
  strength: 80,
  strengthExp: 0,
  intel: 60,
  intelExp: 0,
  politics: 50,
  politicsExp: 0,
  charm: 65,
  charmExp: 0,
  injury: 0,
  experience: 1000,
  dedication: 100,
  officerLevel: 5,
  officerCity: 1,
  recentWar: 0,
  crew: 5000,
  crewType: 1,
  train: 100,
  atmos: 100,
  dex: { 1: 100, 2: 50 },
  age: 30,
  bornYear: 180,
  deadYear: 250,
  special: "",
  specAge: 0,
  special2: "",
  specAge2: 0,
  weapon: "",
  book: "",
  horse: "",
  item: "",
  turnTime: new Date(),
  recentWarTime: null,
  makeLimit: 0,
  killTurn: 0,
  block: 0,
  defenceTrain: 80,
  tournamentState: 0,
  lastTurn: {},
  meta: {},
  penalty: {},
  npc: 0,
  startAge: 20,
  belong: 1,
  betray: 0,
  dedLevel: 0,
  expLevel: 0,
  officerLock: 0,
  affinity: 500,
  personal: "None",
});

describe("WarUnitTriggerRegistry", () => {
  const createRng = (seed = "test") => new RandUtil(new LiteHashDRBG(seed));

  it("트리거는 우선순위에 따라 실행되어야 함", () => {
    const registry = new WarUnitTriggerRegistry();
    const results: string[] = [];

    const attackerGeneral = createMockGeneral(1, "공격자");
    const defenderGeneral = createMockGeneral(2, "수비자");
    const rng = createRng();

    const attacker = new WarUnitGeneral(attackerGeneral, rng, true);
    const defender = new WarUnitGeneral(defenderGeneral, rng, false);

    const createTrigger = (
      name: string,
      priority: number,
      unit: WarUnitGeneral
    ): WarUnitTrigger => ({
      name,
      priority,
      raiseType: RaiseType.NONE,
      unit,
      attempt: () => true,
      actionWar: () => {
        results.push(name);
        return { delta: {}, continueExecution: true };
      },
    });

    registry.registerMany(
      createTrigger("Late", TriggerPriority.POST, attacker),
      createTrigger("Early", TriggerPriority.PRE, attacker),
      createTrigger("Mid", TriggerPriority.BODY, attacker)
    );

    registry.fire(attacker, defender, rng);

    expect(results).toEqual(["Early", "Mid", "Late"]);
  });

  it("cascade control: continueExecution이 false면 다음 트리거가 실행되지 않아야 함", () => {
    const registry = new WarUnitTriggerRegistry();
    const results: string[] = [];

    const rng = createRng();
    const attacker = new WarUnitGeneral(createMockGeneral(1, "공격자"), rng, true);
    const defender = new WarUnitGeneral(createMockGeneral(2, "수비자"), rng, false);

    registry.registerMany(
      {
        name: "First",
        priority: 10,
        raiseType: RaiseType.NONE,
        unit: attacker,
        attempt: () => true,
        actionWar: () => {
          results.push("First");
          return { delta: {}, continueExecution: true };
        },
      },
      {
        name: "Stopper",
        priority: 20,
        raiseType: RaiseType.NONE,
        unit: attacker,
        attempt: () => true,
        actionWar: () => {
          results.push("Stopper");
          return { delta: {}, continueExecution: false };
        },
      },
      {
        name: "Never",
        priority: 30,
        raiseType: RaiseType.NONE,
        unit: attacker,
        attempt: () => true,
        actionWar: () => {
          results.push("Never");
          return { delta: {}, continueExecution: true };
        },
      }
    );

    const result = registry.fire(attacker, defender, rng);

    expect(results).toEqual(["First", "Stopper"]);
    expect(result.stopped).toBe(true);
  });

  it("selfEnv/opposeEnv를 통해 공격자/수비자 간 환경 변수가 분리되어야 함", () => {
    const registry = new WarUnitTriggerRegistry();

    const rng = createRng();
    const attacker = new WarUnitGeneral(createMockGeneral(1, "공격자"), rng, true);
    const defender = new WarUnitGeneral(createMockGeneral(2, "수비자"), rng, false);

    registry.registerMany(
      {
        name: "AttackerSetter",
        priority: 10,
        raiseType: RaiseType.NONE,
        unit: attacker,
        attempt: () => true,
        actionWar: (ctx) => {
          ctx.selfEnv["attackerValue"] = 42;
          return { delta: {}, continueExecution: true };
        },
      },
      {
        name: "DefenderSetter",
        priority: 20,
        raiseType: RaiseType.NONE,
        unit: defender,
        attempt: () => true,
        actionWar: (ctx) => {
          ctx.selfEnv["defenderValue"] = 100;
          return { delta: {}, continueExecution: true };
        },
      }
    );

    const result = registry.fire(attacker, defender, rng);

    expect(result.attackerEnv["attackerValue"]).toBe(42);
    expect(result.defenderEnv["defenderValue"]).toBe(100);
    expect(result.attackerEnv["defenderValue"]).toBeUndefined();
    expect(result.defenderEnv["attackerValue"]).toBeUndefined();
  });

  it("스킬 활성화 시스템이 동작해야 함", () => {
    const rng = createRng();
    const attacker = new WarUnitGeneral(createMockGeneral(1, "공격자"), rng, true);

    expect(attacker.hasActivatedSkill("필살")).toBe(false);

    attacker.activateSkill("필살");
    expect(attacker.hasActivatedSkill("필살")).toBe(true);

    attacker.deactivateSkill("필살");
    expect(attacker.hasActivatedSkill("필살")).toBe(false);
  });

  it("필살 시도/발동 트리거 패턴이 올바르게 동작해야 함", () => {
    const registry = new WarUnitTriggerRegistry();

    // 확률 100%로 설정하여 항상 발동하도록 함
    const rng = createRng("fixed-seed");
    const attacker = new WarUnitGeneral(createMockGeneral(1, "공격자"), rng, true);
    const defender = new WarUnitGeneral(createMockGeneral(2, "수비자"), rng, false);

    // 필살 시도 트리거 (확률 100%)
    const attemptTrigger = new KillingBlowAttemptTrigger(attacker, 1.0);
    // 필살 발동 트리거
    const activateTrigger = new KillingBlowActivateTrigger(attacker, 2.0);

    registry.register(attemptTrigger);
    registry.register(activateTrigger);

    // 트리거 실행
    const result = registry.fire(attacker, defender, rng);

    // 필살 스킬이 활성화되어야 함
    expect(attacker.hasActivatedSkill("필살")).toBe(true);
    expect(attacker.hasActivatedSkill("필살시도")).toBe(true);

    // 전투력 배수가 적용되어야 함
    expect(attacker.warPowerMultiplier).toBe(2.0);

    // 환경 변수에 필살 정보가 있어야 함
    expect(result.attackerEnv["필살시도"]).toBe(true);
    expect(result.attackerEnv["필살발동"]).toBe(true);

    // delta에 로그가 있어야 함
    expect(result.deltas).toHaveLength(2);
  });

  it("merge로 레지스트리를 병합할 수 있어야 함", () => {
    const registry1 = new WarUnitTriggerRegistry();
    const registry2 = new WarUnitTriggerRegistry();
    const results: string[] = [];

    const rng = createRng();
    const attacker = new WarUnitGeneral(createMockGeneral(1, "공격자"), rng, true);
    const defender = new WarUnitGeneral(createMockGeneral(2, "수비자"), rng, false);

    const createTrigger = (name: string, priority: number): WarUnitTrigger => ({
      name,
      priority,
      raiseType: RaiseType.NONE,
      unit: attacker,
      attempt: () => true,
      actionWar: () => {
        results.push(name);
        return { delta: {}, continueExecution: true };
      },
    });

    registry1.register(createTrigger("A", 10));
    registry1.register(createTrigger("C", 30));
    registry2.register(createTrigger("B", 20));

    registry1.merge(registry2);
    registry1.fire(attacker, defender, rng);

    expect(results).toEqual(["A", "B", "C"]);
  });

  it("clear로 모든 트리거를 제거할 수 있어야 함", () => {
    const registry = new WarUnitTriggerRegistry();
    const rng = createRng();
    const attacker = new WarUnitGeneral(createMockGeneral(1, "공격자"), rng, true);

    registry.register({
      name: "Test",
      priority: 1,
      raiseType: RaiseType.NONE,
      unit: attacker,
      attempt: () => true,
      actionWar: () => ({ delta: {}, continueExecution: true }),
    });

    expect(registry.isEmpty()).toBe(false);

    registry.clear();
    expect(registry.isEmpty()).toBe(true);
    expect(registry.getTriggers()).toEqual([]);
  });
});
