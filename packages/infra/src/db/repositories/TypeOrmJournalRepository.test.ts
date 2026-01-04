import 'reflect-metadata';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { DataSource } from 'typeorm';
import { SnapshotMeta, SnapshotBlob, Journal, JournalOffset } from '../entities/Persistence.js';
import { TypeOrmJournalRepository } from './TypeOrmJournalRepository.js';

describe('TypeOrmJournalRepository (TDD)', () => {
  let dataSource: DataSource;
  let repository: TypeOrmJournalRepository;

  beforeAll(async () => {
    // 인메모리 SQLite를 사용하여 실제 DB 연동 테스트 수행
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [SnapshotMeta, SnapshotBlob, Journal, JournalOffset],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  beforeEach(() => {
    repository = new TypeOrmJournalRepository(dataSource);
  });

  it('저널 데이터가 정상적으로 저장되어야 함', async () => {
    const journalData = {
      profile: 'test-profile',
      type: 'test-event',
      payload: { foo: 'bar' },
      seq: '1001',
    };

    await repository.record(journalData);

    const saved = await dataSource.getRepository(Journal).findOneBy({ seq: '1001' });
    expect(saved).toBeDefined();
    expect(saved?.profile).toBe('test-profile');
    expect(saved?.payload).toEqual({ foo: 'bar' });
  });
});
