import { Module } from '@nestjs/common';
import { EngineService } from './engine.service.js';
import { StreamConsumerService } from './stream-consumer.service.js';
import { JournalService } from './journal.service.js';
import { InMemoryWorldService } from './world.service.js';
import { TypeOrmJournalRepository, TypeOrmTurnRepository, TypeOrmSnapshotRepository, getDataSource } from '@sammo-ts/infra';

@Module({
  providers: [
    EngineService,
    StreamConsumerService,
    JournalService,
    InMemoryWorldService,
    {
      provide: 'JOURNAL_REPOSITORY',
      useFactory: () => {
        return new TypeOrmJournalRepository(getDataSource());
      },
    },
    {
      provide: 'TURN_REPOSITORY',
      useFactory: () => {
        return new TypeOrmTurnRepository(getDataSource());
      },
    },
    {
      provide: 'SNAPSHOT_REPOSITORY',
      useFactory: () => {
        return new TypeOrmSnapshotRepository(getDataSource());
      },
    },
  ],
  exports: [EngineService, JournalService],
})
export class AppModule {}
