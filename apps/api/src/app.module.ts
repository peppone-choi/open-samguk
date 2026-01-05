import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppModule as EngineModule } from '@sammo-ts/engine';
import { TrpcRouter } from './trpc/trpc.router.js';
import { RedisStreamDaemonClient, env } from '@sammo-ts/infra';
import { AuthModule } from './auth/auth.module.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { 
  SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn,
  MemberEntity, MemberLogEntity, LoginTokenEntity, SystemEntity,
  ApiLogEntity, ErrLogEntity,
  GeneralEntity, NationEntity, CityEntity, NationTurn
} from '@sammo-ts/infra';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ...existing code...
      entities: [
        SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn,
        MemberEntity, MemberLogEntity, LoginTokenEntity, SystemEntity,
        ApiLogEntity, ErrLogEntity,
        GeneralEntity, NationEntity, CityEntity, NationTurn
      ],
    }),
    TypeOrmModule.forFeature([ApiLogEntity, ErrLogEntity]),
    EngineModule,
    AuthModule,
  ],
  providers: [
    TrpcRouter,
    {
      provide: 'DAEMON_CLIENT',
      useClass: RedisStreamDaemonClient,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
