import type { WorldDelta } from "../domain/entities.js";

export const DeltaUtil = {
  merge(target: WorldDelta, source: WorldDelta): WorldDelta {
    if (source.generals) {
      target.generals = target.generals ?? {};
      for (const [id, delta] of Object.entries(source.generals)) {
        target.generals[Number(id)] = {
          ...target.generals[Number(id)],
          ...delta,
        };
      }
    }

    if (source.nations) {
      target.nations = target.nations ?? {};
      for (const [id, delta] of Object.entries(source.nations)) {
        target.nations[Number(id)] = {
          ...target.nations[Number(id)],
          ...delta,
        };
      }
    }

    if (source.cities) {
      target.cities = target.cities ?? {};
      for (const [id, delta] of Object.entries(source.cities)) {
        target.cities[Number(id)] = {
          ...target.cities[Number(id)],
          ...delta,
        };
      }
    }

    if (source.diplomacy) {
      target.diplomacy = target.diplomacy ?? {};
      for (const [key, delta] of Object.entries(source.diplomacy)) {
        target.diplomacy[key] = {
          ...target.diplomacy[key],
          ...delta,
        };
      }
    }

    if (source.troops) {
      target.troops = target.troops ?? {};
      for (const [id, delta] of Object.entries(source.troops)) {
        target.troops[Number(id)] = {
          ...target.troops[Number(id)],
          ...delta,
        };
      }
    }

    if (source.messages) {
      target.messages = target.messages ?? [];
      target.messages.push(...source.messages);
    }

    if (source.deleteMessages) {
      target.deleteMessages = target.deleteMessages ?? [];
      target.deleteMessages.push(...source.deleteMessages);
    }

    if (source.gameTime) {
      target.gameTime = { ...target.gameTime, ...source.gameTime };
    }

    if (source.env) {
      target.env = { ...target.env, ...source.env };
    }

    if (source.logs) {
      target.logs = target.logs ?? {};
      if (source.logs.general) {
        target.logs.general = target.logs.general ?? {};
        for (const [id, logs] of Object.entries(source.logs.general)) {
          target.logs.general[Number(id)] = target.logs.general[Number(id)] ?? [];
          target.logs.general[Number(id)].push(...logs);
        }
      }
      if (source.logs.nation) {
        target.logs.nation = target.logs.nation ?? {};
        for (const [id, logs] of Object.entries(source.logs.nation)) {
          target.logs.nation[Number(id)] = target.logs.nation[Number(id)] ?? [];
          target.logs.nation[Number(id)].push(...logs);
        }
      }
      if (source.logs.global) {
        target.logs.global = target.logs.global ?? [];
        target.logs.global.push(...source.logs.global);
      }
    }

    return target;
  },

  apply<T extends object>(snapshot: T, delta: any): T {
    const result = { ...snapshot } as any;

    if (delta.generals) {
      result.generals = { ...result.generals };
      for (const [id, gDelta] of Object.entries(delta.generals)) {
        const nId = Number(id);
        result.generals[nId] = { ...result.generals[nId], ...(gDelta as any) };
      }
    }

    if (delta.nations) {
      result.nations = { ...result.nations };
      for (const [id, nDelta] of Object.entries(delta.nations)) {
        const nId = Number(id);
        result.nations[nId] = { ...result.nations[nId], ...(nDelta as any) };
      }
    }

    if (delta.cities) {
      result.cities = { ...result.cities };
      for (const [id, cDelta] of Object.entries(delta.cities)) {
        const nId = Number(id);
        result.cities[nId] = { ...result.cities[nId], ...(cDelta as any) };
      }
    }

    if (delta.gameTime) {
      result.gameTime = { ...result.gameTime, ...delta.gameTime };
    }

    if (delta.env) {
      result.env = { ...result.env, ...delta.env };
    }

    // diplomacy, troops 등도 필요에 따라 추가
    return result as T;
  },
};
