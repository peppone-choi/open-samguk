import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

/**
 * Game session for multi-server support
 */
export interface GameSessionInfo {
  memberId: number;
  serverId: string;
  generalId: number;
  generalName: string;
  loginAt: Date;
  lastActiveAt: Date;
}

/**
 * GameSessionService - 멀티서버 게임 세션 관리
 *
 * 각 서버별로 유저가 어떤 장수로 로그인했는지 관리합니다.
 * - 한 유저는 여러 서버에 동시에 로그인 가능
 * - 각 서버당 하나의 장수만 활성화 가능
 */
@Injectable()
export class GameSessionService {
  private readonly prisma: PrismaClientType;

  constructor() {
    this.prisma = createPrismaClient();
  }

  /**
   * 게임 서버에 로그인 (장수 선택)
   * - 이미 해당 서버에 세션이 있으면 업데이트
   * - 없으면 새로 생성
   */
  async loginToServer(
    memberId: number,
    serverId: string,
    generalId: number,
    generalName: string
  ): Promise<GameSessionInfo> {
    const session = await this.prisma.gameSession.upsert({
      where: {
        memberId_serverId: { memberId, serverId },
      },
      update: {
        generalId,
        generalName,
        loginAt: new Date(),
        lastActiveAt: new Date(),
      },
      create: {
        memberId,
        serverId,
        generalId,
        generalName,
        loginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    return {
      memberId: session.memberId,
      serverId: session.serverId,
      generalId: session.generalId,
      generalName: session.generalName,
      loginAt: session.loginAt,
      lastActiveAt: session.lastActiveAt,
    };
  }

  /**
   * 특정 서버에서 로그아웃
   */
  async logoutFromServer(memberId: number, serverId: string): Promise<boolean> {
    try {
      await this.prisma.gameSession.delete({
        where: {
          memberId_serverId: { memberId, serverId },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 모든 서버에서 로그아웃
   */
  async logoutFromAllServers(memberId: number): Promise<number> {
    const result = await this.prisma.gameSession.deleteMany({
      where: { memberId },
    });
    return result.count;
  }

  /**
   * 특정 서버의 세션 정보 조회
   */
  async getSession(memberId: number, serverId: string): Promise<GameSessionInfo | null> {
    const session = await this.prisma.gameSession.findUnique({
      where: {
        memberId_serverId: { memberId, serverId },
      },
    });

    if (!session) return null;

    return {
      memberId: session.memberId,
      serverId: session.serverId,
      generalId: session.generalId,
      generalName: session.generalName,
      loginAt: session.loginAt,
      lastActiveAt: session.lastActiveAt,
    };
  }

  /**
   * 유저의 모든 활성 세션 목록 조회
   */
  async getAllSessions(memberId: number): Promise<GameSessionInfo[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: { memberId },
      orderBy: { lastActiveAt: "desc" },
    });

    return sessions.map(
      (session: {
        memberId: number;
        serverId: string;
        generalId: number;
        generalName: string;
        loginAt: Date;
        lastActiveAt: Date;
      }) => ({
        memberId: session.memberId,
        serverId: session.serverId,
        generalId: session.generalId,
        generalName: session.generalName,
        loginAt: session.loginAt,
        lastActiveAt: session.lastActiveAt,
      })
    );
  }

  /**
   * 세션 활성 시간 갱신 (heartbeat)
   */
  async touchSession(memberId: number, serverId: string): Promise<boolean> {
    try {
      await this.prisma.gameSession.update({
        where: {
          memberId_serverId: { memberId, serverId },
        },
        data: {
          lastActiveAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 특정 서버의 활성 유저 수 조회
   * @param serverId 서버 ID
   * @param activeWithinSeconds 최근 N초 이내 활동한 유저만 (기본 300초 = 5분)
   */
  async getActiveUserCount(serverId: string, activeWithinSeconds = 300): Promise<number> {
    const cutoff = new Date(Date.now() - activeWithinSeconds * 1000);

    const count = await this.prisma.gameSession.count({
      where: {
        serverId,
        lastActiveAt: { gte: cutoff },
      },
    });

    return count;
  }

  /**
   * 특정 서버의 활성 유저 목록 조회
   */
  async getActiveUsers(
    serverId: string,
    activeWithinSeconds = 300
  ): Promise<
    Array<{ memberId: number; generalId: number; generalName: string; lastActiveAt: Date }>
  > {
    const cutoff = new Date(Date.now() - activeWithinSeconds * 1000);

    const sessions = await this.prisma.gameSession.findMany({
      where: {
        serverId,
        lastActiveAt: { gte: cutoff },
      },
      orderBy: { lastActiveAt: "desc" },
      select: {
        memberId: true,
        generalId: true,
        generalName: true,
        lastActiveAt: true,
      },
    });

    return sessions;
  }

  /**
   * 오래된 세션 정리 (cleanup job)
   * @param olderThanHours N시간 이상 비활성 세션 삭제 (기본 24시간)
   */
  async cleanupStaleSessions(olderThanHours = 24): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    const result = await this.prisma.gameSession.deleteMany({
      where: {
        lastActiveAt: { lt: cutoff },
      },
    });

    return result.count;
  }

  /**
   * 장수 ID로 세션 찾기 (해당 장수가 현재 누구에 의해 플레이되고 있는지)
   */
  async findSessionByGeneral(serverId: string, generalId: number): Promise<GameSessionInfo | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        serverId,
        generalId,
      },
    });

    if (!session) return null;

    return {
      memberId: session.memberId,
      serverId: session.serverId,
      generalId: session.generalId,
      generalName: session.generalName,
      loginAt: session.loginAt,
      lastActiveAt: session.lastActiveAt,
    };
  }
}
