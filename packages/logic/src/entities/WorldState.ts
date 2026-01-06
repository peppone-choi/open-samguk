import type { General, GeneralId, NationId, CityId } from "./General.js";
import type { Nation } from "./Nation.js";
import type { City } from "./City.js";
import type { Troop } from "./Troop.js";
import type { Diplomacy } from "./Diplomacy.js";

export interface GameEnv {
  year: number;
  month: number;
  startYear: number;
  turnTerm: number;
  scenario: number;
  scenarioName: string;
  serverId: string;
  maxTurn: number;
  [key: string]: unknown;
}

export interface WorldState {
  env: GameEnv;
  generals: Map<GeneralId, General>;
  nations: Map<NationId, Nation>;
  cities: Map<CityId, City>;
  troops: Map<GeneralId, Troop>;
  diplomacy: Map<string, Diplomacy>;
}

export interface WorldStateIndexes {
  generalsByNation: Map<NationId, Set<GeneralId>>;
  generalsByCity: Map<CityId, Set<GeneralId>>;
  citiesByNation: Map<NationId, Set<CityId>>;
  frontCities: Set<CityId>;
  supplyCities: Set<CityId>;
}

export function createEmptyWorldState(): WorldState {
  return {
    env: {
      year: 180,
      month: 1,
      startYear: 180,
      turnTerm: 300,
      scenario: 0,
      scenarioName: "",
      serverId: "",
      maxTurn: 48,
    },
    generals: new Map(),
    nations: new Map(),
    cities: new Map(),
    troops: new Map(),
    diplomacy: new Map(),
  };
}

export function createEmptyIndexes(): WorldStateIndexes {
  return {
    generalsByNation: new Map(),
    generalsByCity: new Map(),
    citiesByNation: new Map(),
    frontCities: new Set(),
    supplyCities: new Set(),
  };
}

export function getDiplomacyKey(me: NationId, you: NationId): string {
  return `${me}:${you}`;
}
