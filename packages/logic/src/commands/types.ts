import type { General, GeneralId, NationId } from "../entities/General.js";
import type { City } from "../entities/City.js";
import type { Nation } from "../entities/Nation.js";
import type { RNG } from "@sammo/common";

export interface CommandResult {
  success: boolean;
  message?: string;
  logs: CommandLog[];
  changes: StateChange[];
}

export interface CommandLog {
  type: "general" | "nation" | "world";
  targetId: GeneralId | NationId;
  message: string;
  date: string;
}

export interface StateChange {
  entity: "general" | "city" | "nation" | "troop";
  id: number;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export type CommandArg = Record<string, unknown> | null;

export interface CommandEnv {
  year: number;
  month: number;
  startYear: number;
  develcost: number;
  showImgLevel: number;
}

export interface ConstraintInput {
  general: General;
  city: City | null;
  nation: Nation | null;
  cmdArg: CommandArg;
  destGeneral: General | null;
  destCity: City | null;
  destNation: Nation | null;
}

export interface ConstraintResult {
  passed: boolean;
  failReason?: string;
  constraintName?: string;
}

export interface LastTurn {
  command: string;
  arg: CommandArg;
  term: number;
}

export type CommandCost = [gold: number, rice: number];

export interface CommandMeta {
  key: string;
  name: string;
  reqArg: boolean;
  category: "general" | "nation";
  description?: string;
}

export interface ICommand {
  getMeta(): CommandMeta;
  getName(): string;
  getBrief(): string;
  argTest(): boolean;
  canDisplay(): boolean;
  testMinConditionMet(): string | null;
  testFullConditionMet(): string | null;
  testPermissionToReserve(): string | null;
  getCost(): CommandCost;
  getPreReqTurn(): number;
  getPostReqTurn(): number;
  run(rng: RNG): CommandResult;
  exportJSVars(): Record<string, unknown>;
}
