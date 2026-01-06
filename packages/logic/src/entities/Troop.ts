import type { NationId, GeneralId } from "./General.js";

export interface Troop {
  troopLeader: GeneralId;
  nation: NationId;
  name: string;
}

export function createEmptyTroop(): Troop {
  return {
    troopLeader: 0,
    nation: 0,
    name: "",
  };
}
