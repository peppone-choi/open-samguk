import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class TroopService {
  private readonly prisma = createPrismaClient();

  async getTroopList(nationId: number) {
    const troops = await this.prisma.troop.findMany({
      where: { nationId },
    });

    const result = await Promise.all(
      troops.map(async (troop: any) => {
        const members = await this.prisma.general.findMany({
          where: { troopId: troop.troopLeader },
          select: {
            no: true,
            name: true,
            officerLevel: true,
            cityId: true,
            crew: true,
            crewType: true,
            turnTime: true,
          },
          orderBy: [{ officerLevel: "desc" }, { no: "asc" }],
        });

        const leader = members.find((m: any) => m.no === troop.troopLeader);

        // Fetch reserved commands for the leader
        const reservedCommands = leader
          ? await this.prisma.generalTurn.findMany({
              where: { generalId: leader.no },
              orderBy: { turnIdx: "asc" },
              take: 3,
              select: { brief: true, action: true },
            })
          : [];

        return {
          id: troop.troopLeader,
          name: troop.name,
          nationId: troop.nationId,
          leader: leader ?? null,
          members,
          memberCount: members.length,
          turnTime: leader?.turnTime ?? null,
          reservedCommandBrief: reservedCommands.map((c: any) => c.brief || c.action),
        };
      })
    );

    return result;
  }

  async createTroop(generalId: number, name: string) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
    });

    if (!general) throw new Error("장수가 없습니다.");
    if (general.nationId === 0) throw new Error("소속 국가가 없습니다.");
    if (general.troopId !== 0) throw new Error("이미 부대에 소속되어 있습니다.");

    const existingTroop = await this.prisma.troop.findUnique({
      where: { troopLeader: generalId },
    });

    if (existingTroop) throw new Error("이미 부대장입니다.");

    const troop = await this.prisma.troop.create({
      data: {
        troopLeader: generalId,
        nationId: general.nationId,
        name,
      },
    });

    await this.prisma.general.update({
      where: { no: generalId },
      data: { troopId: generalId },
    });

    return troop;
  }

  async joinTroop(generalId: number, troopLeaderId: number) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
    });

    if (!general) throw new Error("장수가 없습니다.");
    if (general.troopId !== 0) throw new Error("이미 부대에 소속되어 있습니다.");

    const troop = await this.prisma.troop.findUnique({
      where: { troopLeader: troopLeaderId },
    });

    if (!troop) throw new Error("존재하지 않는 부대입니다.");
    if (troop.nationId !== general.nationId)
      throw new Error("다른 국가의 부대에는 가입할 수 없습니다.");

    await this.prisma.general.update({
      where: { no: generalId },
      data: { troopId: troopLeaderId },
    });

    return { success: true, troopId: troopLeaderId };
  }

  async exitTroop(generalId: number) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
    });

    if (!general) throw new Error("장수가 없습니다.");
    if (general.troopId === 0) throw new Error("소속된 부대가 없습니다.");

    const isLeader = general.troopId === generalId;
    if (isLeader) {
      await this.prisma.general.updateMany({
        where: { troopId: generalId },
        data: { troopId: 0 },
      });

      await this.prisma.troop.delete({
        where: { troopLeader: generalId },
      });

      return { success: true, disbanded: true };
    }

    await this.prisma.general.update({
      where: { no: generalId },
      data: { troopId: 0 },
    });

    return { success: true, disbanded: false };
  }

  async kickFromTroop(leaderId: number, targetGeneralId: number) {
    const leader = await this.prisma.general.findUnique({
      where: { no: leaderId },
    });

    if (!leader) throw new Error("장수가 없습니다.");

    const troop = await this.prisma.troop.findUnique({
      where: { troopLeader: leaderId },
    });

    if (!troop) throw new Error("부대장이 아닙니다.");

    const target = await this.prisma.general.findUnique({
      where: { no: targetGeneralId },
    });

    if (!target || target.troopId !== leaderId) throw new Error("해당 장수는 부대원이 아닙니다.");
    if (targetGeneralId === leaderId) throw new Error("부대장은 스스로를 추방할 수 없습니다.");

    await this.prisma.general.update({
      where: { no: targetGeneralId },
      data: { troopId: 0 },
    });

    return { success: true };
  }

  async setTroopName(leaderId: number, name: string) {
    const troop = await this.prisma.troop.findUnique({
      where: { troopLeader: leaderId },
    });

    if (!troop) throw new Error("부대장이 아닙니다.");

    await this.prisma.troop.update({
      where: { troopLeader: leaderId },
      data: { name },
    });

    return { success: true };
  }
}
