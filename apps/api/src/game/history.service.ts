import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class HistoryService {
  private readonly prisma = createPrismaClient();

  async getWorldHistory(limit = 50, beforeId?: number) {
    const whereClause = beforeId ? { id: { lt: beforeId } } : {};

    return this.prisma.worldHistory.findMany({
      where: {
        nationId: 0,
        ...whereClause,
      },
      orderBy: { id: "desc" },
      take: limit,
    });
  }

  async getNationHistory(nationId: number, limit = 50, beforeId?: number) {
    const whereClause = beforeId ? { id: { lt: beforeId } } : {};

    return this.prisma.worldHistory.findMany({
      where: {
        nationId,
        ...whereClause,
      },
      orderBy: { id: "desc" },
      take: limit,
    });
  }

  async getGlobalRecords(limit = 50, afterId?: number) {
    const whereClause = afterId ? { id: { gt: afterId } } : {};

    return this.prisma.generalRecord.findMany({
      where: {
        generalId: 0,
        logType: "history",
        ...whereClause,
      },
      orderBy: { id: "desc" },
      take: limit,
    });
  }

  async getRecentRecords(
    generalId: number,
    lastGeneralRecordId = 0,
    lastWorldHistoryId = 0,
    limit = 15
  ) {
    const generalRecords = await this.prisma.generalRecord.findMany({
      where: {
        generalId,
        logType: "action",
        id: { gt: lastGeneralRecordId },
      },
      orderBy: { id: "desc" },
      take: limit,
      select: { id: true, text: true },
    });

    const globalRecords = await this.prisma.generalRecord.findMany({
      where: {
        generalId: 0,
        logType: "history",
        id: { gt: lastGeneralRecordId },
      },
      orderBy: { id: "desc" },
      take: limit,
      select: { id: true, text: true },
    });

    const worldHistory = await this.prisma.worldHistory.findMany({
      where: {
        nationId: 0,
        id: { gt: lastWorldHistoryId },
      },
      orderBy: { id: "desc" },
      take: limit,
      select: { id: true, text: true },
    });

    return {
      general: generalRecords,
      global: globalRecords,
      history: worldHistory,
    };
  }

  async getRankings(type: string, limit = 20) {
    return this.prisma.rankData.findMany({
      where: { type },
      orderBy: { value: "desc" },
      take: limit,
      include: {
        general: {
          select: {
            no: true,
            name: true,
            nationId: true,
            picture: true,
            imgSvr: true,
          },
        },
      },
    });
  }

  async getStatistics() {
    const nationStats = await this.prisma.general.groupBy({
      by: ["nationId"],
      _count: { no: true },
      where: { nationId: { gt: 0 } },
    });

    const npcStats = await this.prisma.general.groupBy({
      by: ["npc"],
      _count: { no: true },
    });

    const totalGenerals = await this.prisma.general.count();

    const activeNations = await this.prisma.nation.count({
      where: { level: { gt: 0 } },
    });

    return {
      nationStats,
      npcStats,
      totalGenerals,
      activeNations,
    };
  }
}
