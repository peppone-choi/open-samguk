import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '@sammo-ts/infra';
import { SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn } from '@sammo-ts/infra';

/**
 * TypeORM CLI를 위한 Data Source 설정
 * PROFILE 환경변수에 따라 해당 스키마의 마이그레이션을 처리함
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  schema: env.PROFILE, // 현재 프로필 스키마 대상
  synchronize: false,
  logging: true,
  entities: [SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
