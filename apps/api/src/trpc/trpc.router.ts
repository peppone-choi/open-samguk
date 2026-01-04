import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router.js';
import { EngineService } from '@sammo-ts/engine';
import { IDaemonClient } from '@sammo-ts/logic';

@Injectable()
export class TrpcRouter implements OnModuleInit {
  constructor(
    private readonly engineService: EngineService,
    @Inject('DAEMON_CLIENT')
    private readonly daemonClient: IDaemonClient,
  ) {}

  onModuleInit() {
    // This will be handled in main.ts
  }

  getMiddleware() {
    return createExpressMiddleware({
      router: appRouter,
      createContext: () => ({
        engineService: this.engineService,
        daemonClient: this.daemonClient,
      }),
    });
  }
}
