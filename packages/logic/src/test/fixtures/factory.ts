import {
  WorldSnapshot,
  General,
  Nation,
  City,
  Diplomacy,
  Troop,
  Message,
  GameTime,
} from "../../domain/entities.js";

/**
 * 최소 스냅샷 생성
 */
export function createMinimalSnapshot(
  overrides?: Partial<WorldSnapshot>,
): WorldSnapshot {
  return {
    generals: {},
    nations: {},
    cities: {},
    diplomacy: {},
    troops: {},
    messages: {},
    gameTime: { year: 184, month: 1 },
    env: {},
    ...overrides,
  };
}

/**
 * 장수 생성
 */
export function createGeneral(
  id: number,
  overrides?: Partial<General>,
): General {
  return {
    id,
    name: `장수${id}`,
    ownerId: id,
    nationId: 0,
    cityId: 1,
    troopId: 0,
    gold: 1000,
    rice: 1000,
    leadership: 50,
    leadershipExp: 0,
    strength: 50,
    strengthExp: 0,
    intel: 50,
    intelExp: 0,
    politics: 50,
    politicsExp: 0,
    charm: 50,
    charmExp: 0,
    injury: 0,
    experience: 0,
    dedication: 50,
    officerLevel: 0,
    officerCity: 0,
    recentWar: 0,
    crew: 0,
    crewType: 0,
    train: 80,
    atmos: 80,
    dex: {},
    age: 20,
    bornYear: 160,
    deadYear: 240,
    special: "",
    specAge: 0,
    special2: "",
    specAge2: 0,
    weapon: "",
    book: "",
    horse: "",
    item: "",
    turnTime: new Date("0184-01-01T00:00:00Z"),
    recentWarTime: null,
    makeLimit: 0,
    killTurn: 0,
    block: 0,
    defenceTrain: 80,
    tournamentState: 0,
    lastTurn: {},
    meta: {},
    penalty: {},
    ...overrides,
  };
}

/**
 * 국가 생성
 */
export function createNation(id: number, overrides?: Partial<Nation>): Nation {
  return {
    id,
    name: `국가${id}`,
    color: "#FF0000",
    chiefGeneralId: 0,
    capitalCityId: 1,
    gold: 10000,
    rice: 10000,
    rate: 15,
    rateTmp: 15,
    tech: 1000,
    power: 1000,
    level: 1,
    gennum: 0,
    typeCode: "che_중립",
    scoutLevel: 0,
    warState: 0,
    strategicCmdLimit: 36,
    surrenderLimit: 72,
    spy: {},
    meta: {},
    ...overrides,
  };
}

/**
 * 도시 생성
 */
export function createCity(id: number, overrides?: Partial<City>): City {
  return {
    id,
    name: `도시${id}`,
    nationId: 0,
    level: 5,
    supply: 1,
    front: 0,
    pop: 50000,
    popMax: 100000,
    agri: 5000,
    agriMax: 10000,
    comm: 5000,
    commMax: 10000,
    secu: 100,
    secuMax: 100,
    def: 5000,
    defMax: 10000,
    wall: 5000,
    wallMax: 10000,
    trust: 100,
    gold: 0,
    rice: 0,
    region: 1,
    state: 0,
    term: 0,
    conflict: {},
    meta: {},
    ...overrides,
  };
}

/**
 * 외교 관계 생성
 */
export function createDiplomacy(
  srcNationId: number,
  destNationId: number,
  overrides?: Partial<Diplomacy>,
): Diplomacy {
  return {
    id: srcNationId * 1000 + destNationId,
    srcNationId,
    destNationId,
    state: "neutral",
    term: 0,
    meta: {},
    ...overrides,
  };
}

/**
 * 부대 생성
 */
export function createTroop(
  id: number,
  nationId: number,
  overrides?: Partial<Troop>,
): Troop {
  return {
    id,
    nationId,
    name: `부대${id}`,
    meta: {},
    ...overrides,
  };
}

/**
 * 메시지 생성
 */
export function createMessage(
  id: number,
  overrides?: Partial<Message>,
): Message {
  return {
    id,
    mailbox: "general",
    srcId: null,
    destId: null,
    text: "",
    sentAt: new Date("0184-01-01T00:00:00Z"),
    meta: {},
    ...overrides,
  };
}

/**
 * 게임 시간 생성
 */
export function createGameTime(
  year: number = 184,
  month: number = 1,
): GameTime {
  return { year, month };
}

/**
 * 기본 게임 스냅샷 생성 (국가 1개, 도시 1개, 장수 1명)
 */
export function createBasicSnapshot(
  generalOverrides?: Partial<General>,
  nationOverrides?: Partial<Nation>,
  cityOverrides?: Partial<City>,
): WorldSnapshot {
  const nation = createNation(1, { chiefGeneralId: 1, ...nationOverrides });
  const city = createCity(1, { nationId: 1, ...cityOverrides });
  const general = createGeneral(1, {
    nationId: 1,
    cityId: 1,
    ...generalOverrides,
  });

  return createMinimalSnapshot({
    generals: { 1: general },
    nations: { 1: nation },
    cities: { 1: city },
  });
}
