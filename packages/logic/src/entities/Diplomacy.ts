import type { DiplomacyState, DiplomacyDocState } from "./enums.js";
import type { NationId, GeneralId } from "./General.js";

export interface Diplomacy {
  no: number;
  me: NationId;
  you: NationId;
  state: DiplomacyState;
  term: number;
  dead: number;
  showing: Date | null;
}

export interface DiplomacyDocument {
  no: number;
  srcNationId: NationId;
  destNationId: NationId;
  prevNo: number | null;
  state: DiplomacyDocState;
  textBrief: string;
  textDetail: string;
  date: Date;
  srcSigner: GeneralId;
  destSigner: GeneralId | null;
  aux: Record<string, unknown> | null;
}

export function createEmptyDiplomacy(): Diplomacy {
  return {
    no: 0,
    me: 0,
    you: 0,
    state: 0 as DiplomacyState,
    term: 0,
    dead: 0,
    showing: null,
  };
}
