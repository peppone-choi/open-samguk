import { RandUtil } from "@sammo/common";
import { WorldSnapshot, ReservedTurn, City as CityEntity } from "./entities.js";
import { MapUtil } from "./MapData.js";
import { GameConst } from "./GameConst.js";

interface NPCAction {
  action: string;
  arg: Record<string, unknown>;
}

const NPC_TYPE = {
  USER: 0,
  POSSESS: 1,
  GENERAL: 2,
  CHIEF: 3,
  LORD: 4,
  TROOP_LEADER: 5,
  UNSELECTABLE: 6,
  INVADER: 9,
} as const;

export class NPCAutomation {
  decideAction(rng: RandUtil, snapshot: WorldSnapshot, generalId: number): NPCAction | null {
    const general = snapshot.generals[generalId];
    if (!general) return null;

    if (general.npc < NPC_TYPE.GENERAL) {
      return null;
    }

    if (general.nationId === 0) {
      return this.decideWandererAction(rng, snapshot, generalId);
    }

    const nation = snapshot.nations[general.nationId];
    if (!nation) {
      return { action: "휴식", arg: {} };
    }

    const city = snapshot.cities[general.cityId];
    if (!city) {
      return { action: "휴식", arg: {} };
    }

    const isAtWar = this.isNationAtWar(snapshot, general.nationId);
    const frontCities = this.getFrontCities(snapshot, general.nationId);
    const rearCities = this.getRearCities(snapshot, general.nationId);
    const isOnFront = frontCities.some((c) => c.id === general.cityId);
    const isOnRear = rearCities.some((c) => c.id === general.cityId);

    if (isAtWar) {
      return this.decideWarAction(
        rng,
        snapshot,
        generalId,
        isOnFront,
        isOnRear,
        frontCities,
        rearCities
      );
    }

    return this.decidePeaceAction(rng, snapshot, generalId, city, frontCities, rearCities);
  }

  private decideWandererAction(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number
  ): NPCAction {
    const nations = Object.values(snapshot.nations).filter((n) => n.id !== 0);
    if (nations.length > 0) {
      const targetNation = rng.choice(nations);
      return {
        action: "임관",
        arg: { destNationID: targetNation.id },
      };
    }

    return { action: "휴식", arg: {} };
  }

  private decideWarAction(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number,
    isOnFront: boolean,
    isOnRear: boolean,
    frontCities: CityEntity[],
    rearCities: CityEntity[]
  ): NPCAction {
    const general = snapshot.generals[generalId];

    if (general.crew < general.leadership * 50) {
      if (isOnRear) {
        return this.recruitAction(rng, snapshot, generalId);
      }
      if (rearCities.length > 0) {
        const dest = rng.choice(rearCities);
        return {
          action: "NPC능동",
          arg: { optionText: "순간이동", destCityID: dest.id },
        };
      }
    }

    if (general.crew > 0) {
      if (general.train < 80 || general.atmos < 80) {
        return this.trainAction(rng, snapshot, generalId);
      }

      if (!isOnFront && frontCities.length > 0) {
        const dest = rng.choice(frontCities);
        return {
          action: "NPC능동",
          arg: { optionText: "순간이동", destCityID: dest.id },
        };
      }

      if (isOnFront) {
        const enemyCity = this.findAdjacentEnemyCity(snapshot, general.cityId);
        if (enemyCity) {
          return {
            action: "출병",
            arg: { destCityID: enemyCity.id },
          };
        }
      }
    }

    return this.recruitAction(rng, snapshot, generalId);
  }

  private decidePeaceAction(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number,
    city: CityEntity,
    frontCities: CityEntity[],
    rearCities: CityEntity[]
  ): NPCAction {
    const general = snapshot.generals[generalId];

    if (general.crew < general.leadership * 30) {
      return this.recruitAction(rng, snapshot, generalId);
    }

    if (general.crew > 0 && (general.train < 70 || general.atmos < 70)) {
      return this.trainAction(rng, snapshot, generalId);
    }

    const develCost = snapshot.env["develcost"] ?? 20;
    if (general.gold >= develCost && general.rice >= develCost) {
      return this.developAction(rng, snapshot, generalId, city);
    }

    return { action: "휴식", arg: {} };
  }

  private recruitAction(_rng: RandUtil, snapshot: WorldSnapshot, generalId: number): NPCAction {
    const general = snapshot.generals[generalId];
    if (general.gold >= GameConst.draftGoldCost) {
      return { action: "모병", arg: {} };
    }
    return { action: "휴식", arg: {} };
  }

  private trainAction(rng: RandUtil, _snapshot: WorldSnapshot, _generalId: number): NPCAction {
    const actions = ["훈련", "사기진작"];
    return { action: rng.choice(actions), arg: {} };
  }

  private developAction(
    rng: RandUtil,
    _snapshot: WorldSnapshot,
    _generalId: number,
    city: CityEntity
  ): NPCAction {
    const actions: string[] = [];

    if (city.agri < city.agriMax * 0.9) {
      actions.push("개간");
    }
    if (city.comm < city.commMax * 0.9) {
      actions.push("상업");
    }
    if (city.secu < city.secuMax * 0.7) {
      actions.push("치안");
    }
    if (city.def < city.defMax * 0.8) {
      actions.push("수비");
    }
    if (city.wall < city.wallMax * 0.8) {
      actions.push("성벽");
    }
    if (city.trust < 90) {
      actions.push("민심");
    }

    if (actions.length === 0) {
      return { action: "휴식", arg: {} };
    }

    return { action: rng.choice(actions), arg: {} };
  }

  private isNationAtWar(snapshot: WorldSnapshot, nationId: number): boolean {
    for (const diplomacy of Object.values(snapshot.diplomacy)) {
      if (
        (diplomacy.srcNationId === nationId || diplomacy.destNationId === nationId) &&
        diplomacy.state === "0"
      ) {
        return true;
      }
    }
    return false;
  }

  private getFrontCities(snapshot: WorldSnapshot, nationId: number): CityEntity[] {
    return Object.values(snapshot.cities).filter((c) => c.nationId === nationId && c.front >= 2);
  }

  private getRearCities(snapshot: WorldSnapshot, nationId: number): CityEntity[] {
    return Object.values(snapshot.cities).filter((c) => c.nationId === nationId && c.front === 0);
  }

  private findAdjacentEnemyCity(snapshot: WorldSnapshot, cityId: number): CityEntity | null {
    const city = snapshot.cities[cityId];
    if (!city) return null;

    const connections = MapUtil.getConnections(cityId);
    for (const connId of connections) {
      const connCity = snapshot.cities[connId];
      if (connCity && connCity.nationId !== city.nationId) {
        return connCity;
      }
    }
    return null;
  }

  assignNPCTurns(rng: RandUtil, snapshot: WorldSnapshot, generalId: number): ReservedTurn[] | null {
    const existingTurns = snapshot.generalTurns[generalId];
    if (existingTurns && existingTurns.length > 0) {
      return null;
    }

    const action = this.decideAction(rng, snapshot, generalId);
    if (!action) {
      return null;
    }

    return [
      {
        generalId,
        turnIdx: 0,
        action: action.action,
        arg: action.arg,
      },
    ];
  }
}
