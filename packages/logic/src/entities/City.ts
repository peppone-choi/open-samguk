import type { CityLevel } from "./enums.js";
import type { NationId, CityId, GeneralId } from "./General.js";

export interface CityConflict {
  [key: string]: unknown;
}

export interface CityPopulation {
  pop: number;
  popMax: number;
  dead: number;
}

export interface CityEconomy {
  agri: number;
  agriMax: number;
  comm: number;
  commMax: number;
  secu: number;
  secuMax: number;
  trust: number;
  trade: number | null;
}

export interface CityDefense {
  def: number;
  defMax: number;
  wall: number;
  wallMax: number;
}

export interface City {
  city: CityId;
  name: string;
  level: CityLevel;
  nation: NationId;
  supply: number;
  front: number;

  population: CityPopulation;
  economy: CityEconomy;
  defense: CityDefense;

  officerSet: GeneralId;
  state: number;
  region: number;
  term: number;

  conflict: CityConflict;
}

export function createEmptyCity(): City {
  return {
    city: 0,
    name: "",
    level: 1 as CityLevel,
    nation: 0,
    supply: 1,
    front: 0,
    population: { pop: 0, popMax: 0, dead: 0 },
    economy: {
      agri: 0,
      agriMax: 0,
      comm: 0,
      commMax: 0,
      secu: 0,
      secuMax: 0,
      trust: 0,
      trade: null,
    },
    defense: { def: 0, defMax: 0, wall: 0, wallMax: 0 },
    officerSet: 0,
    state: 0,
    region: 0,
    term: 0,
    conflict: {},
  };
}
