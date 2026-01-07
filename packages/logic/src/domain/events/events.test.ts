import { describe, it, expect } from "vitest";
import { WorldSnapshot } from "../entities.js";
import { EventRegistry, EventTarget } from "./types.js";
import { PopulationGrowthEvent } from "./pre-month/PopulationGrowthEvent.js";
import { ResourceMaintenanceEvent } from "./pre-month/ResourceMaintenanceEvent.js";
import { InternalDecayEvent } from "./pre-month/InternalDecayEvent.js";
import { DisasterEvent } from "./month/DisasterEvent.js";
import { HarvestEvent } from "./month/HarvestEvent.js";

function createTestSnapshot(overrides: Partial<WorldSnapshot> = {}): WorldSnapshot {
  return {
    generals: {
      1: {
        id: 1,
        name: "유비",
        ownerId: 1,
        nationId: 1,
        cityId: 1,
        troopId: 0,
        gold: 5000,
        rice: 3000,
        leadership: 80,
        leadershipExp: 0,
        strength: 70,
        strengthExp: 0,
        intel: 60,
        intelExp: 0,
        politics: 75,
        politicsExp: 0,
        charm: 90,
        charmExp: 0,
        injury: 0,
        experience: 1000,
        dedication: 5000,
        officerLevel: 12,
        officerCity: 1,
        recentWar: 0,
        crew: 5000,
        crewType: 1,
        train: 80,
        atmos: 80,
        dex: { 1: 100 },
        age: 30,
        bornYear: 160,
        deadYear: 223,
        special: "none",
        specAge: 30,
        special2: "none",
        specAge2: 30,
        weapon: "",
        book: "",
        horse: "",
        item: "",
        turnTime: new Date(),
        recentWarTime: null,
        makeLimit: 0,
        killTurn: 0,
        block: 0,
        defenceTrain: 0,
        tournamentState: 0,
        lastTurn: {},
        meta: {},
        penalty: {},
      },
    },
    nations: {
      1: {
        id: 1,
        name: "촉한",
        color: "#FF0000",
        chiefGeneralId: 1,
        capitalCityId: 1,
        gold: 50000,
        rice: 30000,
        rate: 20,
        rateTmp: 20,
        tech: 100,
        power: 1000,
        level: 5,
        gennum: 10,
        typeCode: "A",
        scoutLevel: 1,
        warState: 0,
        strategicCmdLimit: 0,
        surrenderLimit: 0,
        spy: {},
        meta: { rate: 20 },
        aux: {},
      },
    },
    cities: {
      1: {
        id: 1,
        name: "성도",
        nationId: 1,
        level: 5,
        supply: 1,
        front: 0,
        pop: 100000,
        popMax: 200000,
        agri: 5000,
        agriMax: 10000,
        comm: 5000,
        commMax: 10000,
        secu: 5000,
        secuMax: 10000,
        def: 5000,
        defMax: 10000,
        wall: 5000,
        wallMax: 10000,
        trust: 80,
        gold: 1000,
        rice: 1000,
        region: 1,
        state: 0,
        term: 0,
        conflict: {},
        meta: {},
      },
    },
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: {
      year: 190,
      month: 6,
    },
    env: {
      startyear: 184,
      hiddenSeed: "test-seed-123",
    },
    ...overrides,
  };
}

describe("PopulationGrowthEvent", () => {
  it("should only execute in June and December", () => {
    const event = new PopulationGrowthEvent();

    // June - should execute
    const snapshotJune = createTestSnapshot({ gameTime: { year: 190, month: 6 } });
    expect(event.condition(snapshotJune)).toBe(true);

    // December - should execute
    const snapshotDec = createTestSnapshot({ gameTime: { year: 190, month: 12 } });
    expect(event.condition(snapshotDec)).toBe(true);

    // Other months - should not execute
    const snapshotMar = createTestSnapshot({ gameTime: { year: 190, month: 3 } });
    expect(event.condition(snapshotMar)).toBe(false);
  });

  it("should increase population based on tax rate", () => {
    const event = new PopulationGrowthEvent();
    const snapshot = createTestSnapshot({ gameTime: { year: 190, month: 6 } });

    const delta = event.action(snapshot);

    expect(delta.cities).toBeDefined();
    expect(delta.cities![1]).toBeDefined();
    expect(delta.cities![1]!.pop).toBeGreaterThan(snapshot.cities[1]!.pop);
  });

  it("should set neutral city trust to 50 and decay internal stats", () => {
    const event = new PopulationGrowthEvent();
    const neutralCity = {
      ...createTestSnapshot().cities[1]!,
      id: 2,
      nationId: 0,
      trust: 80,
    };
    const snapshot = createTestSnapshot({
      gameTime: { year: 190, month: 6 },
      cities: {
        ...createTestSnapshot().cities,
        2: neutralCity,
      },
    });

    const delta = event.action(snapshot);

    expect(delta.cities![2]!.trust).toBe(50);
    expect(delta.cities![2]!.agri).toBeLessThan(neutralCity.agri);
  });
});

describe("ResourceMaintenanceEvent", () => {
  it("should deduct maintenance fees for generals with over 10000 resources", () => {
    const event = new ResourceMaintenanceEvent();
    const richGeneral = {
      ...createTestSnapshot().generals[1]!,
      gold: 20000,
    };
    const snapshot = createTestSnapshot({
      gameTime: { year: 190, month: 6 },
      generals: { 1: richGeneral },
    });

    const delta = event.action(snapshot);

    expect(delta.generals).toBeDefined();
    expect(delta.generals![1]).toBeDefined();
    // 10000 초과: 3% 유지비 → 20000 * 0.97 = 19400
    expect(delta.generals![1]!.gold).toBe(19400);
  });

  it("should deduct maintenance fees for nations with over 100000 resources", () => {
    const event = new ResourceMaintenanceEvent();
    const richNation = {
      ...createTestSnapshot().nations[1]!,
      gold: 200000,
    };
    const snapshot = createTestSnapshot({
      gameTime: { year: 190, month: 6 },
      nations: { 1: richNation },
    });

    const delta = event.action(snapshot);

    expect(delta.nations).toBeDefined();
    expect(delta.nations![1]).toBeDefined();
    // 100000 초과: 5% 유지비 → 200000 * 0.95 = 190000
    expect(delta.nations![1]!.gold).toBe(190000);
  });
});

describe("InternalDecayEvent", () => {
  it("should decay internal stats by 1%", () => {
    const event = new InternalDecayEvent();
    const snapshot = createTestSnapshot({ gameTime: { year: 190, month: 6 } });

    const delta = event.action(snapshot);

    expect(delta.cities).toBeDefined();
    expect(delta.cities![1]!.agri).toBe(Math.floor(5000 * 0.99)); // 4950
    expect(delta.cities![1]!.comm).toBe(Math.floor(5000 * 0.99));
    expect(delta.cities![1]!.secu).toBe(Math.floor(5000 * 0.99));
  });
});

describe("DisasterEvent", () => {
  it("should not execute before 3 years from start", () => {
    const event = new DisasterEvent();

    // Year 186 (2 years after start) - should not execute
    const snapshot = createTestSnapshot({
      gameTime: { year: 186, month: 1 },
      env: { startyear: 184 },
    });
    expect(event.condition(snapshot)).toBe(false);

    // Year 187 (3 years after start) - should execute (on proper months)
    const snapshot2 = createTestSnapshot({
      gameTime: { year: 187, month: 1 },
      env: { startyear: 184 },
    });
    expect(event.condition(snapshot2)).toBe(true);
  });

  it("should only execute in January, April, July, October", () => {
    const event = new DisasterEvent();

    const months = [1, 4, 7, 10];
    for (const month of months) {
      const snapshot = createTestSnapshot({
        gameTime: { year: 190, month },
        env: { startyear: 184 },
      });
      expect(event.condition(snapshot)).toBe(true);
    }

    // Other months should not trigger
    const snapshot = createTestSnapshot({
      gameTime: { year: 190, month: 6 },
      env: { startyear: 184 },
    });
    expect(event.condition(snapshot)).toBe(false);
  });

  it("should reset city state for cities with state <= 10", () => {
    const event = new DisasterEvent();
    const cityWithState = {
      ...createTestSnapshot().cities[1]!,
      state: 5,
    };
    const snapshot = createTestSnapshot({
      gameTime: { year: 190, month: 1 },
      env: { startyear: 184, hiddenSeed: "no-disaster-seed" },
      cities: { 1: cityWithState },
    });

    const delta = event.action(snapshot);

    // State should be reset to 0 at minimum
    expect(delta.cities![1]!.state).toBeDefined();
  });
});

describe("HarvestEvent", () => {
  it("should only execute in April and July", () => {
    const event = new HarvestEvent();

    // April - should execute
    const snapshotApr = createTestSnapshot({
      gameTime: { year: 190, month: 4 },
      env: { startyear: 184 },
    });
    expect(event.condition(snapshotApr)).toBe(true);

    // July - should execute
    const snapshotJul = createTestSnapshot({
      gameTime: { year: 190, month: 7 },
      env: { startyear: 184 },
    });
    expect(event.condition(snapshotJul)).toBe(true);

    // Other months - should not execute
    const snapshotJan = createTestSnapshot({
      gameTime: { year: 190, month: 1 },
      env: { startyear: 184 },
    });
    expect(event.condition(snapshotJan)).toBe(false);
  });

  it("should not execute before 3 years from start", () => {
    const event = new HarvestEvent();

    const snapshot = createTestSnapshot({
      gameTime: { year: 186, month: 4 },
      env: { startyear: 184 },
    });
    expect(event.condition(snapshot)).toBe(false);
  });
});

describe("EventRegistry", () => {
  it("should register and sort events by priority", () => {
    const registry = new EventRegistry();

    const event1 = new PopulationGrowthEvent();
    const event2 = new InternalDecayEvent();

    registry.register(event1);
    registry.register(event2);

    const preMonthEvents = registry.getEvents(EventTarget.PRE_MONTH);

    // InternalDecayEvent (priority 5) should come before PopulationGrowthEvent (priority 10)
    expect(preMonthEvents[0]!.id).toBe("internal_decay_event");
    expect(preMonthEvents[1]!.id).toBe("population_growth_event");
  });

  it("should run all matching events and merge deltas", () => {
    const registry = new EventRegistry();

    const event1 = new InternalDecayEvent();
    const event2 = new PopulationGrowthEvent();

    registry.register(event1);
    registry.register(event2);

    const snapshot = createTestSnapshot({ gameTime: { year: 190, month: 6 } });
    const combinedDelta = registry.runEvents(EventTarget.PRE_MONTH, snapshot);

    expect(combinedDelta.cities).toBeDefined();
    expect(combinedDelta.logs?.global?.length).toBeGreaterThan(0);
  });
});
