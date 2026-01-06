import type { RawNation } from "./types.js";
import type { Nation } from "../entities/index.js";

export function dbToNation(db: RawNation): Nation {
  return {
    nation: db.nation,
    name: db.name,
    color: db.color,
    capital: db.capital,
    capset: db.capset,
    gennum: db.gennum,
    resources: {
      gold: db.gold,
      rice: db.rice,
    },
    policy: {
      bill: db.bill,
      rate: db.rate,
      rateTmp: db.rateTmp,
      secretLimit: db.secretLimit,
    },
    chiefSet: db.chiefSet,
    scout: db.scout,
    war: db.war,
    strategicCmdLimit: db.strategicCmdLimit,
    surLimit: db.surLimit,
    tech: db.tech,
    power: db.power,
    level: db.level,
    type: db.type,
    spy: db.spy as Record<string, unknown>,
    aux: db.aux as Record<string, unknown>,
  };
}

export function nationToDb(n: Nation): RawNation {
  return {
    nation: n.nation,
    name: n.name,
    color: n.color,
    capital: n.capital,
    capset: n.capset,
    gennum: n.gennum,
    gold: n.resources.gold,
    rice: n.resources.rice,
    bill: n.policy.bill,
    rate: n.policy.rate,
    rateTmp: n.policy.rateTmp,
    secretLimit: n.policy.secretLimit,
    chiefSet: n.chiefSet,
    scout: n.scout,
    war: n.war,
    strategicCmdLimit: n.strategicCmdLimit,
    surLimit: n.surLimit,
    tech: n.tech,
    power: n.power,
    level: n.level,
    type: n.type,
    spy: n.spy,
    aux: n.aux,
  };
}

export function nationToDbUpdate(n: Partial<Nation>): Partial<RawNation> {
  const result: Record<string, unknown> = {};

  if (n.name !== undefined) result.name = n.name;
  if (n.color !== undefined) result.color = n.color;
  if (n.capital !== undefined) result.capital = n.capital;
  if (n.capset !== undefined) result.capset = n.capset;
  if (n.gennum !== undefined) result.gennum = n.gennum;

  if (n.resources) {
    if (n.resources.gold !== undefined) result.gold = n.resources.gold;
    if (n.resources.rice !== undefined) result.rice = n.resources.rice;
  }

  if (n.policy) {
    if (n.policy.bill !== undefined) result.bill = n.policy.bill;
    if (n.policy.rate !== undefined) result.rate = n.policy.rate;
    if (n.policy.rateTmp !== undefined) result.rateTmp = n.policy.rateTmp;
    if (n.policy.secretLimit !== undefined) result.secretLimit = n.policy.secretLimit;
  }

  if (n.war !== undefined) result.war = n.war;
  if (n.tech !== undefined) result.tech = n.tech;
  if (n.power !== undefined) result.power = n.power;
  if (n.level !== undefined) result.level = n.level;
  if (n.spy !== undefined) result.spy = n.spy;
  if (n.aux !== undefined) result.aux = n.aux;

  return result;
}
