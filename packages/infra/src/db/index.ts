import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { env } from '../env.js';
import { SnapshotMeta, SnapshotBlob, Journal, JournalOffset } from './entities/Persistence.js';
import { GeneralTurn } from './entities/GeneralTurn.js';
import { NationTurn } from './entities/NationTurn.js';
import { GeneralEntity } from './entities/General.js';
import { NationEntity } from './entities/Nation.js';
import { CityEntity } from './entities/City.js';
import { MemberEntity } from './entities/Member.js';
import { MemberLogEntity } from './entities/MemberLog.js';
import { LoginTokenEntity } from './entities/LoginToken.js';
import { SystemEntity } from './entities/System.js';
import { ApiLogEntity } from './entities/ApiLog.js';
import { ErrLogEntity } from './entities/ErrLog.js';

export * from './entities/Persistence.js';
export * from './entities/GeneralTurn.js';
export * from './entities/NationTurn.js';
export * from './entities/General.js';
export * from './entities/Nation.js';
export * from './entities/City.js';
export * from './entities/Member.js';
export * from './entities/MemberLog.js';
export * from './entities/LoginToken.js';
export * from './entities/System.js';
export * from './entities/ApiLog.js';
export * from './entities/ErrLog.js';

let dataSource: DataSource | null = null;

export async function createDbClient(options?: Partial<DataSourceOptions>): Promise<DataSource> {
  if (dataSource) return dataSource;

  const defaultOptions: DataSourceOptions = {
    type: 'postgres',
    url: env.DATABASE_URL,
    schema: env.PROFILE, // 프로필 이름을 스키마 이름으로 사용
    synchronize: false,
    logging: env.NODE_ENV === 'development',
    entities: [SnapshotMeta, SnapshotBlob, Journal, JournalOffset, GeneralTurn, NationTurn, GeneralEntity, NationEntity, CityEntity],
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