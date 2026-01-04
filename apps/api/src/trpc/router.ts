import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  // 헬스 체크 및 상태 조회 (Phase K1)
  health: publicProcedure.query(async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  status: publicProcedure.query(async ({ ctx }: any) => {
    return ctx.engineService.getStatus();
  }),
  run: publicProcedure
    .input(z.object({ reason: z.enum(['manual', 'poke']).default('manual') }))
    .mutation(async ({ input, ctx }: any) => {
      const requestId = Math.random().toString(36).substring(7);
      await ctx.daemonClient.sendCommand({
        type: 'run',
        requestId,
        payload: { reason: input.reason },
      });
      return { type: 'accepted', requestId };
    }),
  pause: publicProcedure.mutation(async ({ ctx }: any) => {
    const requestId = Math.random().toString(36).substring(7);
    await ctx.daemonClient.sendCommand({
      type: 'pause',
      requestId,
      payload: {},
    });
    return { type: 'accepted', requestId };
  }),
  resume: publicProcedure.mutation(async ({ ctx }: any) => {
    const requestId = Math.random().toString(36).substring(7);
    await ctx.daemonClient.sendCommand({
      type: 'resume',
      requestId,
      payload: {},
    });
    return { type: 'accepted', requestId };
  }),
});

export type AppRouter = typeof appRouter;
