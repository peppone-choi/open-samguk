import type { NationId, CityId, GeneralId } from "./General.js";

export interface NationSpy {
  [key: string]: unknown;
}

export interface NationAux {
  [key: string]: unknown;
}

export interface NationResources {
  gold: number;
  rice: number;
}

export interface NationPolicy {
  bill: number;
  rate: number;
  rateTmp: number;
  secretLimit: number;
}

export interface Nation {
  nation: NationId;
  name: string;
  color: string;
  capital: number;
  capset: CityId;
  gennum: number;

  resources: NationResources;
  policy: NationPolicy;

  chiefSet: GeneralId;
  scout: number;
  war: number;
  strategicCmdLimit: number;
  surLimit: number;
  tech: number;
  power: number;
  level: number;
  type: string;

  spy: NationSpy;
  aux: NationAux;
}

export interface NationTurnAction {
  id: number;
  nationId: NationId;
  officerLevel: number;
  turnIdx: number;
  action: string;
  arg: Record<string, unknown> | null;
  brief: string | null;
}

export interface NationEnv {
  id: number;
  namespace: NationId;
  key: string;
  value: unknown;
}

export function createEmptyNation(): Nation {
  return {
    nation: 0,
    name: "",
    color: "#ffffff",
    capital: 0,
    capset: 0,
    gennum: 1,
    resources: { gold: 0, rice: 0 },
    policy: { bill: 0, rate: 0, rateTmp: 0, secretLimit: 3 },
    chiefSet: 0,
    scout: 0,
    war: 0,
    strategicCmdLimit: 36,
    surLimit: 72,
    tech: 0,
    power: 0,
    level: 0,
    type: "che_중립",
    spy: {},
    aux: {},
  };
}
