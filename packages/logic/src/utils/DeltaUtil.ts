import { WorldDelta } from '../domain/entities.js';

export class DeltaUtil {
  public static merge(target: WorldDelta, source: WorldDelta): WorldDelta {
    // Logs
    if (source.logs) {
      if (!target.logs) target.logs = {};
      
      if (source.logs.global) {
        if (!target.logs.global) target.logs.global = [];
        target.logs.global.push(...source.logs.global);
      }

      if (source.logs.nation) {
        if (!target.logs.nation) target.logs.nation = {};
        for (const [idStr, msgs] of Object.entries(source.logs.nation)) {
          const id = Number(idStr);
          if (!target.logs.nation[id]) target.logs.nation[id] = [];
          target.logs.nation[id].push(...msgs);
        }
      }

      if (source.logs.general) {
        if (!target.logs.general) target.logs.general = {};
        for (const [idStr, msgs] of Object.entries(source.logs.general)) {
          const id = Number(idStr);
          if (!target.logs.general[id]) target.logs.general[id] = [];
          target.logs.general[id].push(...msgs);
        }
      }
    }

    // Nations
    if (source.nations) {
      if (!target.nations) target.nations = {};
      for (const [idStr, nDelta] of Object.entries(source.nations)) {
        const id = Number(idStr);
        if (!target.nations[id]) target.nations[id] = {};
        Object.assign(target.nations[id], nDelta);
      }
    }

    // Cities
    if (source.cities) {
      if (!target.cities) target.cities = {};
      for (const [idStr, cDelta] of Object.entries(source.cities)) {
        const id = Number(idStr);
        if (!target.cities[id]) target.cities[id] = {};
        Object.assign(target.cities[id], cDelta);
      }
    }

    // Generals
    if (source.generals) {
      if (!target.generals) target.generals = {};
      for (const [idStr, gDelta] of Object.entries(source.generals)) {
        const id = Number(idStr);
        if (!target.generals[id]) target.generals[id] = {};
        Object.assign(target.generals[id], gDelta);
      }
    }

    // GameTime (Source wins)
    if (source.gameTime) {
      target.gameTime = source.gameTime;
    }

    // Diplomacy
    if (source.diplomacy) {
      if (!target.diplomacy) target.diplomacy = {};
      for (const [key, dDelta] of Object.entries(source.diplomacy)) {
        if (!target.diplomacy[key]) target.diplomacy[key] = {};
        Object.assign(target.diplomacy[key], dDelta);
      }
    }

    // Env
    if (source.env) {
      if (!target.env) target.env = {};
      Object.assign(target.env, source.env);
    }

    return target;
  }
}
