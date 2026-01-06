import type { RawCity } from "./types.js";
import type { City, CityLevel } from "../entities/index.js";

export function dbToCity(db: RawCity): City {
  return {
    city: db.city,
    name: db.name,
    level: db.level as CityLevel,
    nation: db.nationId,
    supply: db.supply,
    front: db.front,
    population: {
      pop: db.pop,
      popMax: db.popMax,
      dead: db.dead,
    },
    economy: {
      agri: db.agri,
      agriMax: db.agriMax,
      comm: db.comm,
      commMax: db.commMax,
      secu: db.secu,
      secuMax: db.secuMax,
      trust: db.trust,
      trade: db.trade,
    },
    defense: {
      def: db.def,
      defMax: db.defMax,
      wall: db.wall,
      wallMax: db.wallMax,
    },
    officerSet: db.officerSet,
    state: db.state,
    region: db.region,
    term: db.term,
    conflict: db.conflict as Record<string, unknown>,
  };
}

export function cityToDb(c: City): RawCity {
  return {
    city: c.city,
    name: c.name,
    level: c.level,
    nationId: c.nation,
    supply: c.supply,
    front: c.front,
    pop: c.population.pop,
    popMax: c.population.popMax,
    dead: c.population.dead,
    agri: c.economy.agri,
    agriMax: c.economy.agriMax,
    comm: c.economy.comm,
    commMax: c.economy.commMax,
    secu: c.economy.secu,
    secuMax: c.economy.secuMax,
    trust: c.economy.trust,
    trade: c.economy.trade,
    def: c.defense.def,
    defMax: c.defense.defMax,
    wall: c.defense.wall,
    wallMax: c.defense.wallMax,
    officerSet: c.officerSet,
    state: c.state,
    region: c.region,
    term: c.term,
    conflict: c.conflict,
  };
}

export function cityToDbUpdate(c: Partial<City>): Partial<RawCity> {
  const result: Record<string, unknown> = {};

  if (c.name !== undefined) result.name = c.name;
  if (c.level !== undefined) result.level = c.level;
  if (c.nation !== undefined) result.nationId = c.nation;
  if (c.supply !== undefined) result.supply = c.supply;
  if (c.front !== undefined) result.front = c.front;

  if (c.population) {
    if (c.population.pop !== undefined) result.pop = c.population.pop;
    if (c.population.popMax !== undefined) result.popMax = c.population.popMax;
    if (c.population.dead !== undefined) result.dead = c.population.dead;
  }

  if (c.economy) {
    if (c.economy.agri !== undefined) result.agri = c.economy.agri;
    if (c.economy.agriMax !== undefined) result.agriMax = c.economy.agriMax;
    if (c.economy.comm !== undefined) result.comm = c.economy.comm;
    if (c.economy.commMax !== undefined) result.commMax = c.economy.commMax;
    if (c.economy.secu !== undefined) result.secu = c.economy.secu;
    if (c.economy.secuMax !== undefined) result.secuMax = c.economy.secuMax;
    if (c.economy.trust !== undefined) result.trust = c.economy.trust;
    if (c.economy.trade !== undefined) result.trade = c.economy.trade;
  }

  if (c.defense) {
    if (c.defense.def !== undefined) result.def = c.defense.def;
    if (c.defense.defMax !== undefined) result.defMax = c.defense.defMax;
    if (c.defense.wall !== undefined) result.wall = c.defense.wall;
    if (c.defense.wallMax !== undefined) result.wallMax = c.defense.wallMax;
  }

  if (c.state !== undefined) result.state = c.state;
  if (c.term !== undefined) result.term = c.term;
  if (c.conflict !== undefined) result.conflict = c.conflict;

  return result;
}
