import { DataSource } from 'typeorm';
import { IJournalRepository } from '@sammo-ts/logic';
import { Journal } from '../entities/Persistence.js';

/**
 * TypeORM 기반 저널 레포지토리 (Adapter)
 * DDD: 인프라 레이어에서 구체적인 기술(TypeORM)을 사용하여 포트를 구현함
 */
export class TypeOrmJournalRepository implements IJournalRepository {
  constructor(private readonly dataSource: DataSource) {}

  async record(params: {
    profile: string;
    type: string;
    payload: any;
    seq: string;
  }): Promise<void> {
    const repository = this.dataSource.getRepository(Journal);

    const journal = new Journal();
    journal.profile = params.profile;
    journal.type = params.type;
    journal.payload = params.payload;
    journal.seq = params.seq;

    await repository.save(journal);
  }
}
