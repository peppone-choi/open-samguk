import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { env } from '../env.js';
import { SnapshotMeta, SnapshotBlob, Journal, JournalOffset } from './entities/Persistence.js';
import { GeneralTurn } from './entities/GeneralTurn.js';
import { NationTurn } from './entities/NationTurn.js';

export * from './entities/Persistence.js';
export * from './entities/GeneralTurn.js';
export * from './entities/NationTurn.js';

let dataSource: DataSource | null = null;

export async function createDbClient(options?: Partial<DataSourceOptions>): Promise<DataSource> {
  if (dataSource) return dataSource;

  const defaultOptions: DataSourceOptions = {
    type: 'postgres',
    url: env.DATABASE_URL,
    schema: env.PROFILE, // 프로필 이름을 스키마 이름으로 사용
    synchronize: false,
    logging: env.NODE_ENV === 'development',
    entities: [SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn, NationTurn],
    migrations: [],
    subscribers: [],
  };

  dataSource = new DataSource({
    ...defaultOptions,
    ...options,
  } as DataSourceOptions);

  await dataSource.initialize();
  return dataSource;
}

export function getDataSource(): DataSource {
  if (!dataSource) {
    throw new Error('DataSource is not initialized. Call createDbClient first.');
  }
  return dataSource;
}