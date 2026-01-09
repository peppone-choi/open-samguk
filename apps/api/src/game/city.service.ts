import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

@Injectable()
export class CityService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  /**
   * 도시 상세 정보 조회
   */
  async getCityDetail(cityId: number) {
    const city = await this.prisma.city.findUnique({
      where: { city: cityId },
      include: {
        nation: {
          select: {
            nation: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!city) {
      throw new Error("도시가 존재하지 않습니다.");
    }

    return {
      result: true,
      city: {
        ...city,
        nationName: city.nation?.name,
        nationColor: city.nation?.color,
      },
    };
  }

  /**
   * 도시 소속 장수 목록 조회
   */
  async getCityGenerals(cityId: number) {
    const generals = await this.prisma.general.findMany({
      where: { cityId },
      select: {
        no: true,
        name: true,
        picture: true,
        nationId: true,
        leadership: true,
        strength: true,
        intel: true,
        crew: true,
        crewType: true,
        train: true,
        atmos: true,
        officerLevel: true,
        npc: true,
        nation: {
          select: { name: true, color: true },
        },
      },
      orderBy: [{ officerLevel: "desc" }, { experience: "desc" }],
    });

    return {
      result: true,
      generals: generals.map((g: any) => ({
        ...g,
        nationName: g.nation?.name,
        nationColor: g.nation?.color,
      })),
    };
  }

  /**
   * 전체 도시 목록 (지도용)
   */
  async getAllCities() {
    const cities = await this.prisma.city.findMany({
      include: {
        nation: {
          select: { name: true, color: true },
        },
        _count: {
          select: { generals: true },
        },
      },
      orderBy: { city: "asc" },
    });

    return {
      result: true,
      cities: cities.map((c: any) => ({
        city: c.city,
        name: c.name,
        level: c.level,
        nationId: c.nationId,
        nationName: c.nation?.name,
        nationColor: c.nation?.color,
        pop: c.pop,
        popMax: c.popMax,
        agri: c.agri,
        agriMax: c.agriMax,
        comm: c.comm,
        commMax: c.commMax,
        secu: c.secu,
        secuMax: c.secuMax,
        def: c.def,
        defMax: c.defMax,
        wall: c.wall,
        wallMax: c.wallMax,
        trust: c.trust,
        supply: c.supply,
        front: c.front,
        region: c.region,
        generalCount: c._count.generals,
      })),
    };
  }

  /**
   * 국가 소속 도시 목록
   */
  async getNationCities(nationId: number) {
    const cities = await this.prisma.city.findMany({
      where: { nationId },
      include: {
        _count: {
          select: { generals: true },
        },
      },
      orderBy: { city: "asc" },
    });

    return {
      result: true,
      cities: cities.map((c: any) => ({
        city: c.city,
        name: c.name,
        level: c.level,
        pop: c.pop,
        popMax: c.popMax,
        agri: c.agri,
        agriMax: c.agriMax,
        comm: c.comm,
        commMax: c.commMax,
        secu: c.secu,
        secuMax: c.secuMax,
        def: c.def,
        defMax: c.defMax,
        wall: c.wall,
        wallMax: c.wallMax,
        trust: c.trust,
        supply: c.supply,
        front: c.front,
        region: c.region,
        generalCount: c._count.generals,
      })),
    };
  }

  /**
   * 인접 도시 정보 조회 (전방 정보용)
   */
  async getAdjacentCities(cityId: number) {
    // CityMap에서 인접 정보를 가져와야 함
    // 일단 기본 구조만 제공
    const city = await this.prisma.city.findUnique({
      where: { city: cityId },
    });

    if (!city) {
      throw new Error("도시가 존재하지 않습니다.");
    }

    // TODO: CityMap을 사용해 인접 도시 계산
    // 현재는 같은 region의 다른 도시들을 반환
    const adjacentCities = await this.prisma.city.findMany({
      where: {
        region: city.region,
        city: { not: cityId },
      },
      include: {
        nation: {
          select: { name: true, color: true },
        },
        _count: {
          select: { generals: true },
        },
      },
    });

    return {
      result: true,
      currentCity: city,
      adjacentCities: adjacentCities.map((c: any) => ({
        city: c.city,
        name: c.name,
        nationId: c.nationId,
        nationName: c.nation?.name,
        nationColor: c.nation?.color,
        def: c.def,
        wall: c.wall,
        generalCount: c._count.generals,
      })),
    };
  }

  /**
   * 지역별 도시 통계
   */
  async getRegionStats() {
    const cities = await this.prisma.city.findMany({
      select: {
        region: true,
        nationId: true,
        pop: true,
      },
    });

    const regionMap = new Map<
      number,
      { total: number; byNation: Map<number, number>; totalPop: number }
    >();

    for (const city of cities) {
      if (!regionMap.has(city.region)) {
        regionMap.set(city.region, {
          total: 0,
          byNation: new Map(),
          totalPop: 0,
        });
      }
      const stats = regionMap.get(city.region)!;
      stats.total++;
      stats.totalPop += city.pop;

      const nationCount = stats.byNation.get(city.nationId) || 0;
      stats.byNation.set(city.nationId, nationCount + 1);
    }

    const result: Array<{
      region: number;
      totalCities: number;
      totalPop: number;
      nationBreakdown: Array<{ nationId: number; count: number }>;
    }> = [];

    for (const [region, stats] of regionMap) {
      result.push({
        region,
        totalCities: stats.total,
        totalPop: stats.totalPop,
        nationBreakdown: Array.from(stats.byNation.entries()).map(([nationId, count]) => ({
          nationId,
          count,
        })),
      });
    }

    return { result: true, regions: result };
  }
}
