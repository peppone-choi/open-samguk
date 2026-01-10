import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

@Injectable()
export class GlobalService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  /**
   * 게임 상수 조회
   */
  async getGameConst() {
    const storage = await this.prisma.storage.findMany({
      where: { namespace: "game_const" },
    });

    const consts: Record<string, unknown> = {};
    for (const item of storage) {
      consts[item.key] = item.value;
    }

    return { result: true, consts };
  }

  /**
   * 게임 환경 변수 조회
   */
  async getGameEnv() {
    const storage = await this.prisma.storage.findMany({
      where: { namespace: "game_env" },
    });

    const env: Record<string, unknown> = {};
    for (const item of storage) {
      env[item.key] = item.value;
    }

    return { result: true, env };
  }

  /**
   * 글로벌 메뉴 정보 조회
   */
  async getGlobalMenu() {
    const [gameEnv, nations, recentHistory] = await Promise.all([
      this.getGameEnv(),
      this.prisma.nation.findMany({
        where: { gennum: { gt: 0 } },
        select: {
          nation: true,
          name: true,
          color: true,
          gennum: true,
          _count: { select: { cities: true } },
        },
        orderBy: { power: "desc" },
      }),
      this.prisma.worldHistory.findMany({
        orderBy: { id: "desc" },
        take: 5,
        select: {
          id: true,
          year: true,
          month: true,
          text: true,
          nationId: true,
        },
      }),
    ]);

    // 서버 상태 정보
    const onlineCount = await this.prisma.general.count({
      where: {
        npc: 0,
        accessLog: {
          lastRefresh: { gte: new Date(Date.now() - 10 * 60 * 1000) },
        },
      },
    });

    return {
      result: true,
      env: gameEnv.env,
      nations: nations.map((n) => ({
        nation: n.nation,
        name: n.name,
        color: n.color,
        gennum: n.gennum,
        cityCount: n._count.cities,
      })),
      recentHistory,
      onlineCount,
    };
  }

  /**
   * 지도 데이터 조회
   */
  async getMap() {
    const [cities, nations] = await Promise.all([
      this.prisma.city.findMany({
        select: {
          city: true,
          name: true,
          level: true,
          nationId: true,
          region: true,
          pop: true,
          front: true,
          supply: true,
        },
      }),
      this.prisma.nation.findMany({
        where: { gennum: { gt: 0 } },
        select: {
          nation: true,
          name: true,
          color: true,
        },
      }),
    ]);

    type NationBasic = (typeof nations)[number];
    const nationMap = new Map<number, NationBasic>(nations.map((n) => [n.nation, n]));

    return {
      result: true,
      cities: cities.map((c) => {
        const nation = nationMap.get(c.nationId);
        return {
          ...c,
          nationName: nation?.name,
          nationColor: nation?.color,
        };
      }),
      nations,
    };
  }

  /**
   * 캐시된 지도 데이터 조회 (변경 시간 기준)
   */
  async getCachedMap(lastModified?: Date) {
    // 지도 변경 시간 체크
    const mapUpdateTime = await this.prisma.storage.findFirst({
      where: { namespace: "game_env", key: "map_updated_at" },
    });

    const mapUpdatedAt = mapUpdateTime?.value
      ? new Date(mapUpdateTime.value as string)
      : new Date(0);

    if (lastModified && lastModified >= mapUpdatedAt) {
      return { result: true, changed: false };
    }

    const mapData = await this.getMap();
    return {
      ...mapData,
      changed: true,
      updatedAt: mapUpdatedAt,
    };
  }

  /**
   * 현재 히스토리 조회 (현재 연월 기준)
   */
  async getCurrentHistory() {
    const gameEnv = await this.getGameEnv();
    const year = (gameEnv.env.year as number) || 184;
    const month = (gameEnv.env.month as number) || 1;

    const history = await this.prisma.worldHistory.findMany({
      where: { year, month },
      orderBy: { id: "desc" },
      include: {
        nation: {
          select: { name: true, color: true },
        },
      },
    });

    return {
      result: true,
      year,
      month,
      history: history.map((h) => ({
        id: h.id,
        text: h.text,
        nationId: h.nationId,
        nationName: h.nation?.name,
        nationColor: h.nation?.color,
      })),
    };
  }

  /**
   * 장수 목록 조회 (토큰 기반)
   */
  async getGeneralListWithToken(token?: string, nationId?: number) {
    // token은 변경 감지용 (ETag처럼 사용)
    const generals = await this.prisma.general.findMany({
      where: {
        ...(nationId !== undefined ? { nationId } : {}),
        npc: { in: [0, 1, 2, 3, 4, 5] }, // 플레이어 + NPC
      },
      select: {
        no: true,
        name: true,
        picture: true,
        nationId: true,
        cityId: true,
        leadership: true,
        strength: true,
        intel: true,
        officerLevel: true,
        npc: true,
        experience: true,
        dedication: true,
        crew: true,
        nation: { select: { name: true, color: true } },
        city: { select: { name: true } },
      },
      orderBy: [{ nationId: "asc" }, { officerLevel: "desc" }, { experience: "desc" }],
    });

    // 간단한 해시 생성 (변경 감지용)
    const newToken = Buffer.from(JSON.stringify(generals.map((g) => g.no)))
      .toString("base64")
      .slice(0, 16);

    if (token === newToken) {
      return { result: true, changed: false, token: newToken };
    }

    return {
      result: true,
      changed: true,
      token: newToken,
      generals: generals.map((g) => ({
        ...g,
        nationName: g.nation?.name,
        nationColor: g.nation?.color,
        cityName: g.city?.name,
      })),
    };
  }

  /**
   * 외교 상태 조회 (전체)
   */
  async getDiplomacy() {
    const [diplomacies, nations] = await Promise.all([
      this.prisma.diplomacy.findMany({
        where: { state: { not: 0 } },
      }),
      this.prisma.nation.findMany({
        where: { gennum: { gt: 0 } },
        select: { nation: true, name: true, color: true },
      }),
    ]);

    type NationBasic = (typeof nations)[number];
    const nationMap = new Map<number, NationBasic>(nations.map((n) => [n.nation, n]));

    return {
      result: true,
      diplomacies: diplomacies.map((d) => {
        const me = nationMap.get(d.meId);
        const you = nationMap.get(d.youId);
        return {
          ...d,
          meName: me?.name,
          meColor: me?.color,
          youName: you?.name,
          youColor: you?.color,
        };
      }),
      nations,
    };
  }

  /**
   * 최근 기록 조회 (장수 + 세계)
   */
  async getRecentRecord(
    generalId: number,
    lastGeneralRecordId?: number,
    lastWorldHistoryId?: number,
    limit: number = 20
  ) {
    const [generalRecords, worldHistory, gameEnv] = await Promise.all([
      this.prisma.generalRecord.findMany({
        where: {
          generalId,
          ...(lastGeneralRecordId ? { id: { gt: lastGeneralRecordId } } : {}),
        },
        orderBy: { id: "desc" },
        take: limit,
      }),
      this.prisma.worldHistory.findMany({
        where: {
          ...(lastWorldHistoryId ? { id: { gt: lastWorldHistoryId } } : {}),
        },
        orderBy: { id: "desc" },
        take: limit,
        include: {
          nation: { select: { name: true, color: true } },
        },
      }),
      this.getGameEnv(),
    ]);

    return {
      result: true,
      generalRecords,
      worldHistory: worldHistory.map((h) => ({
        id: h.id,
        year: h.year,
        month: h.month,
        text: h.text,
        nationName: h.nation?.name,
        nationColor: h.nation?.color,
      })),
      year: gameEnv.env.year,
      month: gameEnv.env.month,
    };
  }

  /**
   * 서버 통계 조회
   */
  async getServerStats() {
    const [totalGenerals, totalNations, totalCities, onlineCount] = await Promise.all([
      this.prisma.general.count({ where: { npc: 0 } }),
      this.prisma.nation.count({ where: { gennum: { gt: 0 } } }),
      this.prisma.city.count(),
      this.prisma.general.count({
        where: {
          npc: 0,
          accessLog: {
            lastRefresh: { gte: new Date(Date.now() - 10 * 60 * 1000) },
          },
        },
      }),
    ]);

    const gameEnv = await this.getGameEnv();

    return {
      result: true,
      stats: {
        totalGenerals,
        totalNations,
        totalCities,
        onlineCount,
        year: gameEnv.env.year,
        month: gameEnv.env.month,
      },
    };
  }

  /**
   * 지도 데이터 조회 (MapResult 포맷)
   */
  async getMapData(generalId?: number) {
    const [gameEnv, cities, nations, worldHistory] = await Promise.all([
      this.getGameEnv(),
      this.prisma.city.findMany({
        select: {
          city: true,
          level: true,
          state: true,
          nationId: true,
          region: true,
          supply: true,
        },
      }),
      this.prisma.nation.findMany({
        where: { gennum: { gt: 0 } },
        select: {
          nation: true,
          name: true,
          color: true,
          capital: true,
        },
      }),
      this.prisma.worldHistory.findMany({
        where: { nationId: 0 },
        orderBy: { id: "desc" },
        take: 10,
      }),
    ]);

    const env = gameEnv.env;
    let myCity: number | null = null;
    let myNation: number | null = null;

    if (generalId) {
      const general = await this.prisma.general.findUnique({
        where: { no: generalId },
        select: { cityId: true, nationId: true },
      });
      if (general) {
        myCity = general.cityId;
        myNation = general.nationId;
      }
    }

    return {
      version: 2,
      year: (env.year as number) || 0,
      month: (env.month as number) || 0,
      startYear: (env.startYear as number) || 184,
      cityList: cities.map((c) => [c.city, c.level, c.state, c.nationId, c.region, c.supply]),
      nationList: nations.map((n) => [n.nation, n.name, n.color, n.capital]),
      spyList: {},
      shownByGeneralList: [],
      myCity,
      myNation,
      history: worldHistory.map((h) => h.text),
    };
  }

  /**
   * 외교 데이터 조회 (DiplomacyResponse 포맷)
   */
  async getDiplomacyData(generalId?: number) {
    const [nations, diplomacyList, cities] = await Promise.all([
      this.prisma.nation.findMany({
        where: { gennum: { gt: 0 } },
        select: {
          nation: true,
          name: true,
          color: true,
          power: true,
          gennum: true,
          level: true,
          capital: true,
          cities: { select: { name: true } },
        },
        orderBy: { power: "desc" },
      }),
      this.prisma.diplomacy.findMany(),
      this.prisma.city.findMany({
        select: { city: true, conflict: true },
      }),
    ]);

    let myNationID = 0;
    if (generalId) {
      const general = await this.prisma.general.findUnique({
        where: { no: generalId },
        select: { nationId: true },
      });
      myNationID = general?.nationId || 0;
    }

    const diplomacyMatrix: Record<number, Record<number, number>> = {};
    for (const d of diplomacyList) {
      if (!diplomacyMatrix[d.meId]) diplomacyMatrix[d.meId] = {};
      diplomacyMatrix[d.meId][d.youId] = d.state;
    }

    const conflict: [number, Record<number, number>][] = cities
      .filter((c) => {
        const conflictData = c.conflict as Record<string, number> | null;
        return conflictData && Object.keys(conflictData).length > 0;
      })
      .map((c) => [c.city, c.conflict as Record<number, number>]);

    return {
      nations: nations.map((n) => ({
        nation: n.nation,
        name: n.name,
        color: n.color,
        power: n.power,
        gennum: n.gennum,
        level: n.level,
        capital: n.capital,
        cities: n.cities.map((c) => c.name),
      })),
      conflict,
      diplomacyList: diplomacyMatrix,
      myNationID,
    };
  }
}
