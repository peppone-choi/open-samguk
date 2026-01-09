import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { TrpcService } from "../trpc/trpc.service.js";
import { AuthService } from "./auth.service.js";

/**
 * Creates auth tRPC router with login, refresh, logout, session endpoints
 */
export function createAuthRouter(trpc: TrpcService, authService: AuthService) {
  return trpc.router({
    /**
     * Get global salt for client-side password hashing
     */
    getGlobalSalt: trpc.procedure.query(() => {
      return { salt: authService.getGlobalSalt() };
    }),

    /**
     * Register a new user
     */
    register: trpc.procedure
      .input(
        z.object({
          username: z.string().min(3).max(64),
          password: z.string().min(6),
          name: z.string().min(1).max(64),
          thirdUse: z.boolean().optional().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.register(
          input.username,
          input.password,
          input.name,
          input.thirdUse
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "Registration failed",
          });
        }

        return { success: true, userId: result.userId };
      }),

    /**
     * Login with username and password
     */
    login: trpc.procedure
      .input(
        z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.login(input.username, input.password);

        if (!result.success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error || "Login failed",
          });
        }

        return {
          accessToken: result.tokens!.accessToken,
          refreshToken: result.tokens!.refreshToken,
          expiresAt: result.tokens!.accessTokenExpiresAt.toISOString(),
          user: result.user,
        };
      }),

    /**
     * Login with pre-hashed password (legacy client compatibility)
     */
    loginWithHash: trpc.procedure
      .input(
        z.object({
          username: z.string().min(1),
          clientHash: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.loginWithClientHash(input.username, input.clientHash);

        if (!result.success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error || "Login failed",
          });
        }

        return {
          accessToken: result.tokens!.accessToken,
          refreshToken: result.tokens!.refreshToken,
          expiresAt: result.tokens!.accessTokenExpiresAt.toISOString(),
          user: result.user,
        };
      }),

    /**
     * Refresh access token using refresh token
     */
    refresh: trpc.procedure
      .input(
        z.object({
          refreshToken: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.refreshToken(input.refreshToken);

        if (!result.success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error || "Token refresh failed",
          });
        }

        return {
          accessToken: result.tokens!.accessToken,
          refreshToken: result.tokens!.refreshToken,
          expiresAt: result.tokens!.accessTokenExpiresAt.toISOString(),
          user: result.user,
        };
      }),

    /**
     * Logout - invalidate refresh token
     */
    logout: trpc.procedure
      .input(
        z.object({
          refreshToken: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        await authService.logout(input.refreshToken);
        return { success: true };
      }),

    /**
     * Get current session info (requires auth)
     */
    session: trpc.protectedProcedure.query(({ ctx }) => {
      return {
        memberId: ctx.user.sub,
        username: ctx.user.username,
        name: ctx.user.name,
        grade: ctx.user.grade,
      };
    }),

    /**
     * Logout from all devices (requires auth)
     */
    logoutAll: trpc.protectedProcedure.mutation(async ({ ctx }) => {
      await authService.logoutAll(ctx.user.sub);
      return { success: true };
    }),

    /**
     * OAuth: Get Kakao login URL
     */
    getKakaoLoginUrl: trpc.procedure
      .input(
        z.object({
          redirectUri: z.string().url(),
        })
      )
      .query(({ input }) => {
        const clientId = process.env.KAKAO_REST_KEY;
        if (!clientId || process.env.KAKAO_ENABLED !== "true") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kakao OAuth is not enabled",
          });
        }

        const url = new URL("https://kauth.kakao.com/oauth/authorize");
        url.searchParams.set("client_id", clientId);
        url.searchParams.set("redirect_uri", input.redirectUri);
        url.searchParams.set("response_type", "code");

        return { url: url.toString() };
      }),

    /**
     * OAuth: Login with Kakao authorization code
     */
    loginWithKakao: trpc.procedure
      .input(
        z.object({
          code: z.string().min(1),
          redirectUri: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.loginWithKakao(input.code, input.redirectUri);

        if (!result.success) {
          if (result.error === "NEEDS_REGISTRATION") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found. Registration required.",
              cause: { needsRegistration: true },
            });
          }
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error || "Kakao login failed",
          });
        }

        return {
          accessToken: result.tokens!.accessToken,
          refreshToken: result.tokens!.refreshToken,
          expiresAt: result.tokens!.accessTokenExpiresAt.toISOString(),
          user: result.user,
          isNewUser: result.isNewUser,
        };
      }),

    /**
     * Request password reset OTP
     */
    requestPasswordReset: trpc.procedure
      .input(
        z.object({
          username: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.requestPasswordReset(input.username);

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "비밀번호 재설정 요청에 실패했습니다.",
          });
        }

        return {
          success: true,
          // Only return OTP in development mode (for testing)
          otp: result.otp,
          expiresAt: result.expiresAt?.toISOString(),
        };
      }),

    /**
     * Reset password with OTP verification
     */
    resetPassword: trpc.procedure
      .input(
        z.object({
          username: z.string().min(1),
          otp: z.string().length(4),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.resetPassword(
          input.username,
          input.otp,
          input.newPassword
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "비밀번호 재설정에 실패했습니다.",
          });
        }

        return { success: true };
      }),
  });
}

export type AuthRouter = ReturnType<typeof createAuthRouter>;
