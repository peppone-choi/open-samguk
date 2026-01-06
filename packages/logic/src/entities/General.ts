import type { NPCType, OfficerLevel, Permission } from "./enums.js";

export type GeneralId = number;
export type NationId = number;
export type CityId = number;
export type MemberId = number;

export interface GeneralAux {
  [key: string]: unknown;
}

export interface GeneralPenalty {
  [key: string]: unknown;
}

export interface GeneralLastTurn {
  [key: string]: unknown;
}

export interface GeneralEquipment {
  weapon: string;
  book: string;
  horse: string;
  item: string;
}

export interface GeneralStats {
  leadership: number;
  leadershipExp: number;
  strength: number;
  strengthExp: number;
  intel: number;
  intelExp: number;
}

export interface GeneralDexterity {
  dex1: number;
  dex2: number;
  dex3: number;
  dex4: number;
  dex5: number;
}

export interface GeneralResources {
  gold: number;
  rice: number;
}

export interface GeneralMilitary {
  crew: number;
  crewType: number;
  train: number;
  atmos: number;
  defenceTrain: number;
}

export interface GeneralTrait {
  personal: string;
  special: string;
  specAge: number;
  special2: string;
  specAge2: number;
}

export interface General {
  no: GeneralId;
  owner: MemberId;
  npcMsg: string;
  npc: NPCType;
  npcOrg: NPCType;
  affinity: number;
  bornYear: number;
  deadYear: number;
  newMsg: number;
  picture: string;
  imgSvr: number;
  name: string;
  ownerName: string | null;

  nation: NationId;
  city: CityId;
  troop: GeneralId;

  stats: GeneralStats;
  dexterity: GeneralDexterity;
  resources: GeneralResources;
  military: GeneralMilitary;
  equipment: GeneralEquipment;
  trait: GeneralTrait;

  injury: number;
  experience: number;
  dedication: number;

  officerLevel: OfficerLevel;
  officerCity: CityId;
  permission: Permission;

  turnTime: Date;
  recentWar: Date | null;
  makeLimit: number;
  killTurn: number | null;
  block: number;

  dedLevel: number;
  expLevel: number;
  age: number;
  startAge: number;
  belong: number;
  betray: number;

  tnmt: number;
  myset: number;
  tournament: number;
  newVote: number;

  lastTurn: GeneralLastTurn;
  aux: GeneralAux;
  penalty: GeneralPenalty;
}

export interface GeneralTurnAction {
  id: number;
  generalId: GeneralId;
  turnIdx: number;
  action: string;
  arg: Record<string, unknown> | null;
  brief: string | null;
}

export interface GeneralAccessLog {
  id: number;
  generalId: GeneralId;
  userId: MemberId | null;
  lastRefresh: Date | null;
  refresh: number;
  refreshTotal: number;
  refreshScore: number;
  refreshScoreTotal: number;
}

export function createEmptyGeneral(): General {
  return {
    no: 0,
    owner: 0,
    npcMsg: "",
    npc: 0 as NPCType,
    npcOrg: 0 as NPCType,
    affinity: 0,
    bornYear: 180,
    deadYear: 300,
    newMsg: 0,
    picture: "",
    imgSvr: 0,
    name: "",
    ownerName: null,
    nation: 0,
    city: 3,
    troop: 0,
    stats: {
      leadership: 50,
      leadershipExp: 0,
      strength: 50,
      strengthExp: 0,
      intel: 50,
      intelExp: 0,
    },
    dexterity: { dex1: 0, dex2: 0, dex3: 0, dex4: 0, dex5: 0 },
    resources: { gold: 1000, rice: 1000 },
    military: { crew: 0, crewType: 0, train: 0, atmos: 0, defenceTrain: 80 },
    equipment: { weapon: "None", book: "None", horse: "None", item: "None" },
    trait: { personal: "None", special: "None", specAge: 0, special2: "None", specAge2: 0 },
    injury: 0,
    experience: 0,
    dedication: 0,
    officerLevel: 0 as OfficerLevel,
    officerCity: 0,
    permission: "normal" as Permission,
    turnTime: new Date(),
    recentWar: null,
    makeLimit: 0,
    killTurn: null,
    block: 0,
    dedLevel: 0,
    expLevel: 0,
    age: 20,
    startAge: 20,
    belong: 1,
    betray: 0,
    tnmt: 1,
    myset: 6,
    tournament: 0,
    newVote: 0,
    lastTurn: {},
    aux: {},
    penalty: {},
  };
}
