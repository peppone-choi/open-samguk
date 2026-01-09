import { Injectable } from "@nestjs/common";
import { initTRPC, TRPCError } from "@trpc/server";
import type { FastifyRequest } from "fastify";
import { AuthService } from "../auth/auth.service.js";
import type { AccessTokenPayload } from "../auth/jwt.service.js";

/**
 * Context passed to all tRPC procedures
 */
export interface TrpcContext {
  req: FastifyRequest;
  user: AccessTokenPayload | null;
}

/**
 * Context factory - extracts user from Authorization header
 */
export function createContext(
  authService: AuthService
): (opts: { req: FastifyRequest }) => Promise<TrpcContext> {
  return async ({ req }) => {
    const authHeader = req.headers.authorization;
    let user: AccessTokenPayload | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      user = await authService.verifyToken(token);
    }

    return { req, user };
  };
}

@Injectable()
export class TrpcService {
  private _trpc = initTRPC.context<TrpcContext>().create();

  public get trpc() {
    return this._trpc;
  }

  /**
   * Public procedure - no authentication required
   */
  public procedure = this._trpc.procedure;

  /**
   * Protected procedure - requires valid access token
   * Throws UNAUTHORIZED if no valid user in context
   */
  public protectedProcedure = this._trpc.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user, // Now guaranteed to be non-null
      },
    });
  });

  /**
   * Admin procedure - requires valid access token with grade >= 5
   */
  public adminProcedure = this._trpc.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }
    if (ctx.user.grade < 5) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

  public router = this._trpc.router;
  public mergeRouters = this._trpc.mergeRouters;
}
