import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule as EngineModule } from '@sammo-ts/engine';
import { TrpcRouter } from './trpc/trpc.router.js';
import { RedisStreamDaemonClient, env } from '@sammo-ts/infra';
import { AuthModule } from './auth/auth.module.js';
import { 
  SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn,
  MemberEntity, MemberLogEntity, LoginTokenEntity, SystemEntity,
  ApiLogEntity, ErrLogEntity,
  GeneralEntity, NationEntity, CityEntity, NationTurn
} from '@sammo-ts/infra';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      schema: env.PROFILE,
      synchronize: false,
      logging: true,
      entities: [
        SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn,
        MemberEntity, MemberLogEntity, LoginTokenEntity, SystemEntity,
        ApiLogEntity, ErrLogEntity,
        GeneralEntity, NationEntity, CityEntity, NationTurn
      ],
    }),
    EngineModule,
    AuthModule,
  ],
  providers: [
    TrpcRouter,
    {
      provide: 'DAEMON_CLIENT',
      useClass: RedisStreamDaemonClient,
    },
  ],
})
export class AppModule {}
