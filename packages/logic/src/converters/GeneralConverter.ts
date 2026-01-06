import type { RawGeneral } from "./types.js";
import type { General, NPCType, OfficerLevel, Permission } from "../entities/index.js";

export function dbToGeneral(db: RawGeneral): General {
  return {
    no: db.no,
    owner: db.owner,
    npcMsg: db.npcMsg,
    npc: db.npc as NPCType,
    npcOrg: db.npcOrg as NPCType,
    affinity: db.affinity,
    bornYear: db.bornYear,
    deadYear: db.deadYear,
    newMsg: db.newMsg,
    picture: db.picture,
    imgSvr: db.imgSvr,
    name: db.name,
    ownerName: db.ownerName,
    nation: db.nationId,
    city: db.cityId,
    troop: db.troopId,
    stats: {
      leadership: db.leadership,
      leadershipExp: db.leadershipExp,
      strength: db.strength,
      strengthExp: db.strengthExp,
      intel: db.intel,
      intelExp: db.intelExp,
    },
    dexterity: {
      dex1: db.dex1,
      dex2: db.dex2,
      dex3: db.dex3,
      dex4: db.dex4,
      dex5: db.dex5,
    },
    resources: {
      gold: db.gold,
      rice: db.rice,
    },
    military: {
      crew: db.crew,
      crewType: db.crewType,
      train: db.train,
      atmos: db.atmos,
      defenceTrain: db.defenceTrain,
    },
    equipment: {
      weapon: db.weapon,
      book: db.book,
      horse: db.horse,
      item: db.item,
    },
    trait: {
      personal: db.personal,
      special: db.special,
      specAge: db.specAge,
      special2: db.special2,
      specAge2: db.specAge2,
    },
    injury: db.injury,
    experience: db.experience,
    dedication: db.dedication,
    officerLevel: db.officerLevel as OfficerLevel,
    officerCity: db.officerCity,
    permission: db.permission as Permission,
    turnTime: db.turnTime,
    recentWar: db.recentWar,
    makeLimit: db.makeLimit,
    killTurn: db.killTurn,
    block: db.block,
    dedLevel: db.dedLevel,
    expLevel: db.expLevel,
    age: db.age,
    startAge: db.startAge,
    belong: db.belong,
    betray: db.betray,
    tnmt: db.tnmt,
    myset: db.myset,
    tournament: db.tournament,
    newVote: db.newVote,
    lastTurn: db.lastTurn as Record<string, unknown>,
    aux: db.aux as Record<string, unknown>,
    penalty: db.penalty as Record<string, unknown>,
  };
}

export function generalToDb(g: General): RawGeneral {
  return {
    no: g.no,
    owner: g.owner,
    npcMsg: g.npcMsg,
    npc: g.npc,
    npcOrg: g.npcOrg,
    affinity: g.affinity,
    bornYear: g.bornYear,
    deadYear: g.deadYear,
    newMsg: g.newMsg,
    picture: g.picture,
    imgSvr: g.imgSvr,
    name: g.name,
    ownerName: g.ownerName,
    nationId: g.nation,
    cityId: g.city,
    troopId: g.troop,
    leadership: g.stats.leadership,
    leadershipExp: g.stats.leadershipExp,
    strength: g.stats.strength,
    strengthExp: g.stats.strengthExp,
    intel: g.stats.intel,
    intelExp: g.stats.intelExp,
    dex1: g.dexterity.dex1,
    dex2: g.dexterity.dex2,
    dex3: g.dexterity.dex3,
    dex4: g.dexterity.dex4,
    dex5: g.dexterity.dex5,
    gold: g.resources.gold,
    rice: g.resources.rice,
    crew: g.military.crew,
    crewType: g.military.crewType,
    train: g.military.train,
    atmos: g.military.atmos,
    defenceTrain: g.military.defenceTrain,
    weapon: g.equipment.weapon,
    book: g.equipment.book,
    horse: g.equipment.horse,
    item: g.equipment.item,
    personal: g.trait.personal,
    special: g.trait.special,
    specAge: g.trait.specAge,
    special2: g.trait.special2,
    specAge2: g.trait.specAge2,
    injury: g.injury,
    experience: g.experience,
    dedication: g.dedication,
    officerLevel: g.officerLevel,
    officerCity: g.officerCity,
    permission: g.permission,
    turnTime: g.turnTime,
    recentWar: g.recentWar,
    makeLimit: g.makeLimit,
    killTurn: g.killTurn,
    block: g.block,
    dedLevel: g.dedLevel,
    expLevel: g.expLevel,
    age: g.age,
    startAge: g.startAge,
    belong: g.belong,
    betray: g.betray,
    tnmt: g.tnmt,
    myset: g.myset,
    tournament: g.tournament,
    newVote: g.newVote,
    lastTurn: g.lastTurn,
    aux: g.aux,
    penalty: g.penalty,
  };
}

export function generalToDbUpdate(g: Partial<General>): Partial<RawGeneral> {
  const result: Record<string, unknown> = {};

  if (g.owner !== undefined) result.owner = g.owner;
  if (g.npcMsg !== undefined) result.npcMsg = g.npcMsg;
  if (g.npc !== undefined) result.npc = g.npc;
  if (g.name !== undefined) result.name = g.name;
  if (g.nation !== undefined) result.nationId = g.nation;
  if (g.city !== undefined) result.cityId = g.city;
  if (g.troop !== undefined) result.troopId = g.troop;

  if (g.stats) {
    if (g.stats.leadership !== undefined) result.leadership = g.stats.leadership;
    if (g.stats.leadershipExp !== undefined) result.leadershipExp = g.stats.leadershipExp;
    if (g.stats.strength !== undefined) result.strength = g.stats.strength;
    if (g.stats.strengthExp !== undefined) result.strengthExp = g.stats.strengthExp;
    if (g.stats.intel !== undefined) result.intel = g.stats.intel;
    if (g.stats.intelExp !== undefined) result.intelExp = g.stats.intelExp;
  }

  if (g.resources) {
    if (g.resources.gold !== undefined) result.gold = g.resources.gold;
    if (g.resources.rice !== undefined) result.rice = g.resources.rice;
  }

  if (g.military) {
    if (g.military.crew !== undefined) result.crew = g.military.crew;
    if (g.military.crewType !== undefined) result.crewType = g.military.crewType;
    if (g.military.train !== undefined) result.train = g.military.train;
    if (g.military.atmos !== undefined) result.atmos = g.military.atmos;
  }

  if (g.injury !== undefined) result.injury = g.injury;
  if (g.experience !== undefined) result.experience = g.experience;
  if (g.dedication !== undefined) result.dedication = g.dedication;
  if (g.turnTime !== undefined) result.turnTime = g.turnTime;
  if (g.aux !== undefined) result.aux = g.aux;

  return result;
}
