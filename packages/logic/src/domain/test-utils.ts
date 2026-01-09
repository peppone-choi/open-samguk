import type {
  General,
  Nation,
  City,
  WorldSnapshot,
  Diplomacy,
  Troop,
  Message,
  GameTime,
} from "./entities.js";

export function createMockGeneral(overrides: Partial<General> = {}): General {
  const base: General = {
    id: 1,
    name: "테스트장수",
    ownerId: 0,
    nationId: 0,
    cityId: 1,
    npc: 0,
    troopId: 0,
    gold: 1000,
    rice: 1000,
    leadership: 70,
    leadershipExp: 0,
    strength: 70,
    strengthExp: 0,
    intel: 70,
    intelExp: 0,
    politics: 70,
    politicsExp: 0,
    charm: 70,
    charmExp: 0,
    injury: 0,
    experience: 0,
    dedication: 0,
    officerLevel: 0,
    officerCity: 0,
    recentWar: 0,
    crew: 0,
    crewType: 0,
    train: 0,
    atmos: 0,
    dex: {},
    age: 20,
    startAge: 20,
    belong: 1,
    betray: 0,
    dedLevel: 0,
    expLevel: 0,
    bornYear: 164,
    deadYear: 250,
    special: "None",
    specAge: 0,
    special2: "None",
    specAge2: 0,
    weapon: "None",
    book: "None",
    horse: "None",
    item: "None",
    turnTime: new Date(),
    recentWarTime: null,
    makeLimit: 0,
    killTurn: 72,
    killnum: 0,
    block: 0,
    defenceTrain: 80,
    tournamentState: 0,
    lastTurn: {},
    meta: {},
    penalty: {},
    officerLock: 0,
    affinity: 500,
    personal: "None",
  };
  return {
    ...base,
    ...overrides,
    affinity: overrides.affinity ?? base.affinity,
    personal: overrides.personal ?? base.personal,
  } as General;
}

export function createMockNation(overrides: Partial<Nation> = {}): Nation {
  return {
    id: 1,
    name: "테스트국가",
    color: "#FF0000",
    chiefGeneralId: 1,
    capitalCityId: 1,
    gold: 10000,
    rice: 10000,
    rate: 20,
    rateTmp: 20,
    tech: 0,
    power: 0,
    level: 0,
    gennum: 1,
    typeCode: "che_중립",
    scoutLevel: 0,
    warState: 0,
    strategicCmdLimit: 36,
    surrenderLimit: 72,
    spy: {},
    meta: {},
    aux: {},
    ...overrides,
  };
}

export function createMockCity(overrides: Partial<City> = {}): City {
  return {
    id: 1,
    name: "테스트도시",
    nationId: 0,
    level: 4,
    supply: 1,
    front: 0,
    pop: 10000,
    popMax: 100000,
    agri: 1000,
    agriMax: 10000,
    comm: 1000,
    commMax: 10000,
    secu: 1000,
    secuMax: 10000,
    def: 1000,
    defMax: 10000,
    wall: 1000,
    wallMax: 3000,
    trust: 50,
    trade: 100,
    region: 0,
    state: 0,
    term: 0,
    conflict: {},
    meta: {},
    dead: 0,
    ...overrides,
  };
}

export function createMockWorldSnapshot(
  overrides: {
    generals?: Record<number, Partial<General>>;
    nations?: Record<number, Partial<Nation>>;
    cities?: Record<number, Partial<City>>;
    diplomacy?: Record<string, Diplomacy>;
    troops?: Record<number, Troop>;
    messages?: Record<number, Message>;
    gameTime?: GameTime;
    env?: Record<string, any>;
  } = {}
): WorldSnapshot {
  const generals: Record<number, General> = {};
  const nations: Record<number, Nation> = {};
  const cities: Record<number, City> = {};

  if (overrides.generals) {
    for (const [id, partial] of Object.entries(overrides.generals)) {
      generals[Number(id)] = createMockGeneral({ id: Number(id), ...partial });
    }
  }

  if (overrides.nations) {
    for (const [id, partial] of Object.entries(overrides.nations)) {
      nations[Number(id)] = createMockNation({ id: Number(id), ...partial });
    }
  }

  if (overrides.cities) {
    for (const [id, partial] of Object.entries(overrides.cities)) {
      cities[Number(id)] = createMockCity({ id: Number(id), ...partial });
    }
  }

  return {
    generals,
    nations,
    cities,
    diplomacy: overrides.diplomacy ?? {},
    troops: overrides.troops ?? {},
    messages: overrides.messages ?? {},
    gameTime: overrides.gameTime ?? { year: 184, month: 1 },
    env: overrides.env ?? {},
    generalTurns: {},
  };
}
