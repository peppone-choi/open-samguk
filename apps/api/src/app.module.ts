import { Module } from '@nestjs/common';
import { AppModule as EngineModule } from '@sammo-ts/engine';
import { TrpcRouter } from './trpc/trpc.router.js';
import { RedisStreamDaemonClient } from '@sammo-ts/infra';

@Module({
  imports: [EngineModule],
  providers: [
    TrpcRouter,
    {
      provide: 'DAEMON_CLIENT',
      useClass: RedisStreamDaemonClient,
    },
  ],
})
export class AppModule {}
