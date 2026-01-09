import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

export enum DiplomacyState {
  NONE = 0,
  WAR = 1,
  CEASEFIRE = 2,
  NON_AGGRESSION = 3,
  ALLIANCE_PROPOSED = 4,
  ALLIANCE = 5,
  PEACE_PROPOSED = 6,
  NON_AGGRESSION_PROPOSED = 7,
}

@Injectable()
export class DiplomacyService {
  private readonly prisma = createPrismaClient();

  async getDiplomacyStatus(viewerNationId: number) {
    const nations = await this.prisma.nation.findMany({
      where: { level: { gt: 0 } },
      select: {
        nation: true,
        name: true,
        color: true,
        level: true,
        power: true,
        gennum: true,
      },
      orderBy: { power: "desc" },
    });

    const nationCities: Record<number, string[]> = {};
    const cities = await this.prisma.city.findMany({
      where: { nationId: { in: nations.map((n: any) => n.nation) } },
      select: { nationId: true, name: true },
    });

    for (const city of cities) {
      if (!nationCities[city.nationId]) {
        nationCities[city.nationId] = [];
      }
      nationCities[city.nationId].push(city.name);
    }

    const diplomacyList = await this.prisma.diplomacy.findMany({
      where: {
        meId: { in: nations.map((n: any) => n.nation) },
        youId: { in: nations.map((n: any) => n.nation) },
      },
    });

    const diplomacyMap: Record<number, Record<number, number>> = {};
    for (const d of diplomacyList) {
      if (!diplomacyMap[d.meId]) {
        diplomacyMap[d.meId] = {};
      }
      const isViewerInvolved = d.meId === viewerNationId || d.youId === viewerNationId;
      diplomacyMap[d.meId][d.youId] = isViewerInvolved ? d.state : this.toNeutralViewState(d.state);
    }

    const conflictCities = await this.prisma.city.findMany({
      where: {
        NOT: { conflict: { equals: {} } },
      },
      select: { city: true, name: true, conflict: true },
    });

    const conflicts = conflictCities
      .map((c: any) => {
        const conflict = c.conflict as Record<string, number>;
        const nationIds = Object.keys(conflict).map(Number);
        if (nationIds.length < 2) return null;

        const total = Object.values(conflict).reduce((a, b) => a + b, 0);
        const percentages: Record<number, number> = {};
        for (const [nId, kills] of Object.entries(conflict)) {
          percentages[Number(nId)] = Math.round((kills / total) * 1000) / 10;
        }

        return {
          cityId: c.city,
          cityName: c.name,
          conflict: percentages,
        };
      })
      .filter((c: any): c is NonNullable<typeof c> => c !== null);

    return {
      nations: nations.map((n: any) => ({
        ...n,
        cities: nationCities[n.nation] ?? [],
      })),
      diplomacyList: diplomacyMap,
      conflicts,
      myNationId: viewerNationId,
    };
  }

  private toNeutralViewState(state: number): number {
    if (state >= 3 && state <= 7) {
      return DiplomacyState.CEASEFIRE;
    }
    return state;
  }

  async getDiplomacyBetween(nationId1: number, nationId2: number) {
    const diplomacy = await this.prisma.diplomacy.findFirst({
      where: {
        meId: nationId1,
        youId: nationId2,
      },
    });

    return diplomacy ?? { meId: nationId1, youId: nationId2, state: 0, term: 0 };
  }

  async getDiplomacyProposals(nationId: number) {
    const incomingProposals = await this.prisma.diplomacyDoc.findMany({
      where: {
        destNationId: nationId,
        state: "proposed",
      },
      include: {
        srcNation: { select: { name: true, color: true } },
      },
      orderBy: { date: "desc" },
    });

    const outgoingProposals = await this.prisma.diplomacyDoc.findMany({
      where: {
        srcNationId: nationId,
        state: "proposed",
      },
      include: {
        destNation: { select: { name: true, color: true } },
      },
      orderBy: { date: "desc" },
    });

    return {
      incoming: incomingProposals,
      outgoing: outgoingProposals,
    };
  }
}
