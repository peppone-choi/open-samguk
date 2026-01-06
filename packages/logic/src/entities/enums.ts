export const enum NPCType {
  Player = 0,
  NPC = 1,
  FixedNPC = 2,
  NPCGeneral = 3,
  NPCKing = 4,
  NPCReserved = 5,
}

export const enum OfficerLevel {
  None = 0,
  Soldier = 1,
  Captain = 2,
  Commander = 3,
  General = 4,
  Marshal = 5,
  Chancellor = 6,
  ViceRuler = 7,
  Ruler = 8,
  Emperor = 9,
  King = 10,
  ViceKing = 11,
  Heir = 12,
}

export const enum Permission {
  Normal = "normal",
  Auditor = "auditor",
  Ambassador = "ambassador",
}

export const enum MessageType {
  Private = "private",
  National = "national",
  Public = "public",
  Diplomacy = "diplomacy",
}

export const enum DiplomacyState {
  None = 0,
  Nonaggression = 1,
  Alliance = 2,
  Vassal = 3,
  War = 7,
}

export const enum DiplomacyDocState {
  Proposed = "proposed",
  Activated = "activated",
  Cancelled = "cancelled",
  Replaced = "replaced",
}

export const enum CityLevel {
  Village = 1,
  Town = 2,
  City = 3,
  Capital = 4,
  Metropolitan = 5,
}

export const enum ArmType {
  Foot = 1,
  Cavalry = 2,
  Archer = 3,
  Siege = 4,
  Castle = 5,
}

export const enum AuctionType {
  BuyRice = "buyRice",
  SellRice = "sellRice",
  UniqueItem = "uniqueItem",
}

export const enum AuctionResource {
  Gold = "gold",
  Rice = "rice",
  InheritPoint = "inheritPoint",
}

export const enum LogType {
  Action = "action",
  BattleBrief = "battle_brief",
  Battle = "battle",
  History = "history",
}

export const enum EventTarget {
  Month = "MONTH",
  PreMonth = "PRE_MONTH",
  OccupyCity = "OCCUPY_CITY",
  DestroyNation = "DESTROY_NATION",
  United = "UNITED",
}

export const enum LockType {
  Game = "GAME",
  Etc = "ETC",
  Tournament = "TOURNAMENT",
}
