import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { TrpcService } from "../trpc/trpc.service.js";
import { GameSessionService } from "./game-session.service.js";

/**
 * Creates game session tRPC router for multi-server support
 * All endpoints require authentication (protectedProcedure)
 */
export function createGameSessionRouter(trpc: TrpcService, gameSessionService: GameSessionService) {
  return trpc.router({
    /**
     * Login to a game server (select general)
     */
    loginToServer: trpc.protectedProcedure
      .input(
        z.object({
          serverId: z.string().min(1).max(32),
          generalId: z.number().int().positive(),
          generalName: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const session = await gameSessionService.loginToServer(
          ctx.user.sub,
          input.serverId,
          input.generalId,
          input.generalName
        );

        return {
          success: true,
          session: {
            serverId: session.serverId,
            generalId: session.generalId,
            generalName: session.generalName,
            loginAt: session.loginAt.toISOString(),
          },
        };
      }),

    /**
     * Logout from a specific game server
     */
    logoutFromServer: trpc.protectedProcedure
      .input(
        z.object({
          serverId: z.string().min(1).max(32),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const success = await gameSessionService.logoutFromServer(ctx.user.sub, input.serverId);
        return { success };
      }),

    /**
     * Logout from all game servers
     */
    logoutFromAllServers: trpc.protectedProcedure.mutation(async ({ ctx }) => {
      const count = await gameSessionService.logoutFromAllServers(ctx.user.sub);
      return { success: true, loggedOutCount: count };
    }),

    /**
     * Get current session for a specific server
     */
    getSession: trpc.protectedProcedure
      .input(
        z.object({
          serverId: z.string().min(1).max(32),
        })
      )
      .query(async ({ ctx, input }) => {
        const session = await gameSessionService.getSession(ctx.user.sub, input.serverId);

        if (!session) {
          return { session: null };
        }

        return {
          session: {
            serverId: session.serverId,
            generalId: session.generalId,
            generalName: session.generalName,
            loginAt: session.loginAt.toISOString(),
            lastActiveAt: session.lastActiveAt.toISOString(),
          },
        };
      }),

    /**
     * Get all active sessions for the current user
     */
    getAllSessions: trpc.protectedProcedure.query(async ({ ctx }) => {
      const sessions = await gameSessionService.getAllSessions(ctx.user.sub);

      return {
        sessions: sessions.map((s) => ({
          serverId: s.serverId,
          generalId: s.generalId,
          generalName: s.generalName,
          loginAt: s.loginAt.toISOString(),
          lastActiveAt: s.lastActiveAt.toISOString(),
        })),
      };
    }),

    /**
     * Touch session (heartbeat) - updates lastActiveAt
     */
    touch: trpc.protectedProcedure
      .input(
        z.object({
          serverId: z.string().min(1).max(32),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const success = await gameSessionService.touchSession(ctx.user.sub, input.serverId);

        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Session not found",
          });
        }

        return { success: true };
      }),

    /**
     * Get active user count for a server (public endpoint)
     */
    getActiveUserCount: trpc.procedure
      .input(
        z.object({
          serverId: z.string().min(1).max(32),
          activeWithinSeconds: z.number().int().positive().max(3600).optional(),
        })
      )
      .query(async ({ input }) => {
        const count = await gameSessionService.getActiveUserCount(
          input.serverId,
          input.activeWithinSeconds ?? 300
        );
        return { count };
      }),

    /**
     * Get active users list for a server (public endpoint)
     */
    getActiveUsers: trpc.procedure
      .input(
        z.object({
          serverId: z.string().min(1).max(32),
          activeWithinSeconds: z.number().int().positive().max(3600).optional(),
        })
      )
      .query(async ({ input }) => {
        const users = await gameSessionService.getActiveUsers(
          input.serverId,
          input.activeWithinSeconds ?? 300
        );

        return {
          users: users.map((u) => ({
            generalId: u.generalId,
            generalName: u.generalName,
            lastActiveAt: u.lastActiveAt.toISOString(),
          })),
        };
      }),
  });
}

export type GameSessionRouter = ReturnType<typeof createGameSessionRouter>;
