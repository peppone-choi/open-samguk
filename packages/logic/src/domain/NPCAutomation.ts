import { RandUtil } from "@sammo/common";
import { WorldSnapshot, ReservedTurn, City as CityEntity } from "./entities.js";
import { MapUtil } from "./MapData.js";
import { GameConst } from "./GameConst.js";

/**
 * NPC 행동 정보
 */
interface NPCAction {
  /** 실행할 커맨드 이름 */
  action: string;
  /** 커맨드 인자 */
  arg: Record<string, unknown>;
}

/**
 * NPC 타입 상수
 */
const NPC_TYPE = {
  /** 일반 사용자 */
  USER: 0,
  /** 점유(소유)된 NPC */
  POSSESS: 1,
  /** 일반 장수 NPC */
  GENERAL: 2,
  /** 수뇌 NPC */
  CHIEF: 3,
  /** 군주 NPC */
  LORD: 4,
  /** 부대장 NPC */
  TROOP_LEADER: 5,
  /** 선택 불가 NPC */
  UNSELECTABLE: 6,
  /** 침입자(이민족) NPC */
  INVADER: 9,
} as const;

/**
 * NPC 자동화 클래스
 * 장수의 상태와 주변 환경을 분석하여 최적의 행동을 결정합니다.
 */
export class NPCAutomation {
  /**
   * 장수의 행동을 결정합니다.
   * 
   * @param rng 난수 생성기
   * @param snapshot 월드 스냅샷
   * @param generalId 장수 ID
   * @returns 결정된 행동 또는 null
   */
  decideAction(rng: RandUtil, snapshot: WorldSnapshot, generalId: number): NPCAction | null {
    const general = snapshot.generals[generalId];
    if (!general) return null;

    // NPC가 아니거나 수명이 다한 경우 제외
    if (general.npc < NPC_TYPE.GENERAL) {
      return null;
    }

    // 재야 장수인 경우
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

    // 국가 정책 및 우선순위 설정 로드
    const priorityList = this.getPriorityList(nation, general);
    const policy = this.getPolicy(nation);

    // 전황 파악
    const isAtWar = this.isNationAtWar(snapshot, general.nationId);
    const frontCities = this.getFrontCities(snapshot, general.nationId);
    const rearCities = this.getRearCities(snapshot, general.nationId);
    const isOnFront = frontCities.some((c) => c.id === general.cityId);
    const isOnRear = rearCities.some((c) => c.id === general.cityId);

    // 1. 우선순위 리스트(지정 커맨드)가 있으면 그에 따라 행동 결정
    if (priorityList.length > 0) {
      for (const actionName of priorityList) {
        let result: NPCAction | null = null;
        switch (actionName) {
          case "recruit":
          case "recruitment":
            if (general.crew < general.leadership * policy.minWarCrew) {
              result = this.recruitAction(rng, snapshot, generalId);
            }
            break;
          case "train":
          case "training":
            if (
              general.crew > 0 &&
              (general.train < policy.properWarTrainAtmos ||
                general.atmos < policy.properWarTrainAtmos)
            ) {
              result = this.trainAction(rng, snapshot, generalId);
            }
            break;
          case "devel":
          case "development":
            if (general.gold >= policy.reqNPCDevelGold && general.rice >= policy.reqNPCDevelRice) {
              result = this.developAction(rng, snapshot, generalId, city);
            }
            break;
          case "war":
            if (isAtWar && general.crew >= general.leadership * policy.minWarCrew) {
              result = this.warAction(rng, snapshot, generalId, isOnFront, frontCities);
            }
            break;
        }
        if (result && result.action !== "휴식") return result;
      }
    }

    // 2. 전쟁 중인 경우의 행동 로직
    if (isAtWar) {
      return this.decideWarAction(
        rng,
        snapshot,
        generalId,
        isOnFront,
        isOnRear,
        frontCities,
        rearCities,
        policy
      );
    }

    // 3. 평시인 경우의 행동 로직
    return this.decidePeaceAction(rng, snapshot, generalId, city, frontCities, rearCities, policy);
  }

  /**
   * 국가 정책 정보를 파싱합니다.
   */
  private getPolicy(nation: any) {
    const policy = (nation.aux?.nationPolicy as any) || {};
    return {
      minWarCrew: policy.minWarCrew ?? 50,
      properWarTrainAtmos: policy.properWarTrainAtmos ?? 80,
      reqNPCDevelGold: policy.reqNPCDevelGold ?? 20,
      reqNPCDevelRice: policy.reqNPCDevelRice ?? 20,
      minNPCWarLeadership: policy.minNPCWarLeadership ?? 30,
    };
  }

  /**
   * 해당 장수의 커맨드 우선순위 리스트를 반환합니다.
   */
  private getPriorityList(nation: any, general: any): string[] {
    const aux = nation.aux as any;
    if (general.officerLevel >= 5) {
      return aux?.chiefPriority || [];
    }
    return aux?.generalPriority || [];
  }

  /**
   * 재야 장수의 행동을 결정합니다 (주로 임관).
   */
  private decideWandererAction(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number
  ): NPCAction {
    const nations = Object.values(snapshot.nations).filter((n) => n.id !== 0);
    if (nations.length > 0) {
      // 무작위 국가에 임관 시도
      const targetNation = rng.choice(nations);
      return {
        action: "임관",
        arg: { destNationID: targetNation.id },
      };
    }

    return { action: "휴식", arg: {} };
  }

  /**
   * 전시 상황에서의 행동 로직
   */
  private decideWarAction(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number,
    isOnFront: boolean,
    isOnRear: boolean,
    frontCities: CityEntity[],
    rearCities: CityEntity[],
    policy: any
  ): NPCAction {
    const general = snapshot.generals[generalId];

    // 병력이 부족한 경우 보충
    if (general.crew < general.leadership * policy.minWarCrew) {
      if (isOnRear) {
        return this.recruitAction(rng, snapshot, generalId);
      }
      // 후방 도시로 이동 후 보충
      if (rearCities.length > 0) {
        const dest = rng.choice(rearCities);
        return {
          action: "NPC능동",
          arg: { optionText: "순간이동", destCityID: dest.id },
        };
      }
    }

    // 훈련 및 사기가 낮은 경우 보완
    if (general.crew > 0) {
      if (
        general.train < policy.properWarTrainAtmos ||
        general.atmos < policy.properWarTrainAtmos
      ) {
        return this.trainAction(rng, snapshot, generalId);
      }

      // 전투 행동 결정
      const warAction = this.warAction(rng, snapshot, generalId, isOnFront, frontCities);
      if (warAction.action !== "휴식") return warAction;
    }

    return this.recruitAction(rng, snapshot, generalId);
  }

  /**
   * 구체적인 전투 행동(이동, 출병)을 결정합니다.
   */
  private warAction(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number,
    isOnFront: boolean,
    frontCities: CityEntity[]
  ): NPCAction {
    const general = snapshot.generals[generalId];
    // 전방이 아니라면 전방 도시로 이동
    if (!isOnFront && frontCities.length > 0) {
      const dest = rng.choice(frontCities);
      return {
        action: "NPC능동",
        arg: { optionText: "순간이동", destCityID: dest.id },
      };
    }

    // 전방인 경우 인접한 적 도시로 출격
    if (isOnFront) {
      const enemyCity = this.findAdjacentEnemyCity(snapshot, general.cityId);
      if (enemyCity) {
        return {
          action: "출격",
          arg: { destCityID: enemyCity.id },
        };
      }
    }
    return { action: "휴식", arg: {} };
  }

  /**
   * 평시 상황에서의 행동 로직 (주로 내정)
   */
  private decidePeaceAction(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number,
    city: CityEntity,
    frontCities: CityEntity[],
    rearCities: CityEntity[],
    policy: any
  ): NPCAction {
    const general = snapshot.generals[generalId];

    // 평시에도 최소한의 병력 유지
    if (general.crew < general.leadership * (policy.minWarCrew * 0.6)) {
      return this.recruitAction(rng, snapshot, generalId);
    }

    // 최소한의 훈련도 유지
    if (
      general.crew > 0 &&
      (general.train < policy.properWarTrainAtmos - 10 ||
        general.atmos < policy.properWarTrainAtmos - 10)
    ) {
      return this.trainAction(rng, snapshot, generalId);
    }

    // 자원이 충분하면 내정 수행
    if (general.gold >= policy.reqNPCDevelGold && general.rice >= policy.reqNPCDevelRice) {
      return this.developAction(rng, snapshot, generalId, city);
    }

    return { action: "휴식", arg: {} };
  }

  /**
   * 모병 행동
   */
  private recruitAction(_rng: RandUtil, snapshot: WorldSnapshot, generalId: number): NPCAction {
    const general = snapshot.generals[generalId];
    if (general.gold >= GameConst.draftGoldCost) {
      return { action: "모병", arg: {} };
    }
    return { action: "휴식", arg: {} };
  }

  /**
   * 훈련 또는 사기진작 행동
   */
  private trainAction(rng: RandUtil, _snapshot: WorldSnapshot, _generalId: number): NPCAction {
    const actions = ["훈련", "사기진작"];
    return { action: rng.choice(actions), arg: {} };
  }

  /**
   * 도시 내정 행동 결정 (수치가 낮은 항목 우선)
   */
  private developAction(
    rng: RandUtil,
    _snapshot: WorldSnapshot,
    _generalId: number,
    city: CityEntity
  ): NPCAction {
    const actions: string[] = [];

    if (city.agri < city.agriMax * 0.9) {
      actions.push("농지개간");
    }
    if (city.comm < city.commMax * 0.9) {
      actions.push("상업투자");
    }
    if (city.secu < city.secuMax * 0.7) {
      actions.push("치안강화");
    }
    if (city.def < city.defMax * 0.8) {
      actions.push("수비강화");
    }
    if (city.wall < city.wallMax * 0.8) {
      actions.push("성벽보수");
    }
    if (city.trust < 90) {
      actions.push("주민선정");
    }

    if (actions.length === 0) {
      return { action: "휴식", arg: {} };
    }

    return { action: rng.choice(actions), arg: {} };
  }

  /**
   * 국가가 현재 전쟁 중인지 확인합니다.
   */
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

  /**
   * 전방 도시 목록을 획득합니다.
   */
  private getFrontCities(snapshot: WorldSnapshot, nationId: number): CityEntity[] {
    return Object.values(snapshot.cities).filter((c) => c.nationId === nationId && c.front >= 2);
  }

  /**
   * 후방 도시 목록을 획득합니다.
   */
  private getRearCities(snapshot: WorldSnapshot, nationId: number): CityEntity[] {
    return Object.values(snapshot.cities).filter((c) => c.nationId === nationId && c.front === 0);
  }

  /**
   * 인접한 적 도시를 찾습니다.
   */
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

  /**
   * NPC의 턴을 예약합니다.
   */
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

