import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class GameService {
  private readonly prisma = createPrismaClient();

  async getGameState(): Promise<any> {
    // TODO: DB에서 현재 상태 로드
    return {
      year: 184,
      month: 1,
      nations: await this.prisma.nation.findMany(),
      cities: await this.prisma.city.findMany(),
    };
  }

  async runTurn(): Promise<void> {
    // 엔진을 통해 턴 진행
    // This might be called by an admin or triggered by the engine app
  }

  async setGeneralTurn(
    generalId: number,
    turnIdx: number,
    action: string,
    arg: any = {}
  ): Promise<void> {
    await this.prisma.generalTurn.upsert({
      where: { generalId_turnIdx: { generalId, turnIdx } },
      update: { action, arg },
      create: { generalId, turnIdx, action, arg },
    });
  }

  async setGeneralTurns(
    generalId: number,
    turns: { turnIdx: number; action: string; arg?: any }[]
  ): Promise<void> {
    await this.prisma.$transaction(
      turns.map((t) =>
        this.prisma.generalTurn.upsert({
          where: { generalId_turnIdx: { generalId, turnIdx: t.turnIdx } },
          update: { action: t.action, arg: t.arg || {} },
          create: { generalId, turnIdx: t.turnIdx, action: t.action, arg: t.arg || {} },
        })
      )
    );
  }

  async getReservedTurns(generalId: number): Promise<any[]> {
    return this.prisma.generalTurn.findMany({
      where: { generalId },
      orderBy: { turnIdx: "asc" },
    });
  }

  async getGeneralDetail(generalId: number): Promise<any> {
    return this.prisma.general.findUnique({
      where: { no: generalId },
      include: {
        turns: {
          orderBy: { turnIdx: "asc" },
        },
        nation: true,
        city: true,
      },
    });
  }

  async getNations(): Promise<any[]> {
    return this.prisma.nation.findMany({
      include: {
        cities: true,
      },
    });
  }

  async getCities(): Promise<any[]> {
    return this.prisma.city.findMany({
      include: {
        nation: true,
      },
    });
  }

  async getUnits(): Promise<any[]> {
    const { UnitRegistry } = await import("@sammo/logic");
    const registry = UnitRegistry.getInstance();
    await registry.load();
    return registry.getAllUnits();
  }
}
