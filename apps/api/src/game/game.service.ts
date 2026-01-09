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

  async getServerList(userId: number): Promise<any[]> {
    // 1. 모든 서버 정보 조회
    const servers = await this.prisma.ngGames.findMany({
      orderBy: { date: "desc" },
    });

    // 2. 사용자의 게임 세션 조회 (어떤 서버에 캐릭터가 있는지)
    const userSessions = await this.prisma.gameSession.findMany({
      where: { memberId: userId },
    });

    // 3. 각 서버별 접속자 수 조회 (Optional: 성능을 위해 캐싱하거나 생략 가능)
    // 여기서는 간단히 각 서버별 세션 수를 카운트
    const serverCounts = await this.prisma.gameSession.groupBy({
      by: ["serverId"],
      _count: {
        _all: true,
      },
    });
    const countMap = new Map<string, number>();
    serverCounts.forEach((c: any) => countMap.set(c.serverId, c._count._all));

    // 4. 데이터 조합
    return servers.map((server: any) => {
      const session = userSessions.find((s: any) => s.serverId === server.serverId);
      const playerCount = countMap.get(server.serverId) || 0;
      const env = server.env as any; // JSON 타입 단언

      // 현재 날짜와 게임 내 날짜(date)를 비교하여 턴 계산 등 가능하나
      // 여기서는 DB에 저장된 date, year, month 정보를 사용한다고 가정
      // NgGames 모델에는 year, month가 없으므로 env나 aux에서 가져와야 할 수도 있음.
      // 일단 date를 기준으로 year/month를 추정하거나 env에 있다고 가정.
      const year = env.year || 0;
      const month = env.month || 0;
      const turnTime = env.turnTerm || 60; // 60분

      return {
        id: server.serverId,
        name: server.serverId, // "che", "kwe" 등
        // 프론트에서 매핑할 이름 (DB에는 serverId만 있음)
        // serverId를 기반으로 프론트에서 표시명을 결정하거나, DB에 korName 필드를 추가해야 함.
        // 여기서는 serverId를 그대로 사용
        korName: server.scenarioName, // 시나리오 이름을 표시명으로 사용하거나 별도 매핑 필요
        status: "running", // running, waiting, closed 판단 로직 필요. 일단 running
        scenario: server.scenarioName,
        year: `${year}년 ${month}월`,
        turnTime: `${turnTime}분`,
        players: playerCount,
        maxPlayers: env.maxUser || 100,
        hasCharacter: !!session,
        characterName: session?.generalName || null,
      };
    });
  }
}
