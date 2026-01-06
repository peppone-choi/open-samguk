export * from "./enums.js";

export type {
  GeneralId,
  NationId,
  CityId,
  MemberId,
  GeneralAux,
  GeneralPenalty,
  GeneralLastTurn,
  GeneralEquipment,
  GeneralStats,
  GeneralDexterity,
  GeneralResources,
  GeneralMilitary,
  GeneralTrait,
  General,
  GeneralTurnAction,
  GeneralAccessLog,
} from "./General.js";
export { createEmptyGeneral } from "./General.js";

export type {
  NationSpy,
  NationAux,
  NationResources,
  NationPolicy,
  Nation,
  NationTurnAction,
  NationEnv,
} from "./Nation.js";
export { createEmptyNation } from "./Nation.js";

export type { CityConflict, CityPopulation, CityEconomy, CityDefense, City } from "./City.js";
export { createEmptyCity } from "./City.js";

export type { Troop } from "./Troop.js";
export { createEmptyTroop } from "./Troop.js";

export type { Diplomacy, DiplomacyDocument } from "./Diplomacy.js";
export { createEmptyDiplomacy } from "./Diplomacy.js";

export type { GameEnv, WorldState, WorldStateIndexes } from "./WorldState.js";
export { createEmptyWorldState, createEmptyIndexes, getDiplomacyKey } from "./WorldState.js";
