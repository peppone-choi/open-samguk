import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

export interface Session {
  id: number;
  memberId: number;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Session management service
 *
 * Handles refresh token storage and session lifecycle.
 * Uses RefreshToken table from Prisma schema.
 */
@Injectable()
export class SessionService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  /**
   * Create a new session (store refresh token hash)
   */
  async createSession(memberId: number, tokenHash: string, expiresAt: Date): Promise<Session> {
    // Clean up expired sessions for this user
    await this.cleanupExpiredSessions(memberId);

    const session = await this.prisma.refreshToken.create({
      data: {
        memberId,
        token: tokenHash,
        validUntil: expiresAt,
      },
    });

    return {
      id: session.id,
      memberId: session.memberId,
      tokenHash: session.token,
      expiresAt: session.validUntil,
      createdAt: session.createdAt,
    };
  }

  /**
   * Get session by refresh token hash
   */
  async getSessionByToken(tokenHash: string): Promise<Session | null> {
    const session = await this.prisma.refreshToken.findFirst({
      where: {
        token: tokenHash,
        validUntil: { gt: new Date() },
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      memberId: session.memberId,
      tokenHash: session.token,
      expiresAt: session.validUntil,
      createdAt: session.createdAt,
    };
  }

  /**
   * Delete session by token hash (logout)
   */
  async deleteSession(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: tokenHash },
    });
  }

  /**
   * Delete all sessions for a user (logout all devices)
   */
  async deleteAllSessions(memberId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { memberId },
    });
  }

  /**
   * Clean up expired sessions for a user
   */
  async cleanupExpiredSessions(memberId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        memberId,
        validUntil: { lt: new Date() },
      },
    });
  }

  /**
   * Clean up all expired sessions (maintenance task)
   */
  async cleanupAllExpiredSessions(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        validUntil: { lt: new Date() },
      },
    });
    return result.count;
  }

  /**
   * Get active session count for a user
   */
  async getActiveSessionCount(memberId: number): Promise<number> {
    return this.prisma.refreshToken.count({
      where: {
        memberId,
        validUntil: { gt: new Date() },
      },
    });
  }

  /**
   * Check if token is valid (exists and not expired)
   */
  async isTokenValid(tokenHash: string): Promise<boolean> {
    const count = await this.prisma.refreshToken.count({
      where: {
        token: tokenHash,
        validUntil: { gt: new Date() },
      },
    });
    return count > 0;
  }
}
