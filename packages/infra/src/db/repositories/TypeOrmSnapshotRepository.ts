import { DataSource } from 'typeorm';
import { ISnapshotRepository, WorldSnapshot } from '@sammo-ts/logic';
import { SnapshotMeta, SnapshotBlob } from '../entities/Persistence.js';

/**
 * TypeORM 기반 스냅샷 레포지토리 (Adapter)
 */
export class TypeOrmSnapshotRepository implements ISnapshotRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getLatestSnapshot(profile: string): Promise<{
    snapshot: WorldSnapshot;
    checksum: string;
    version: number;
  } | null> {
    const metaRepo = this.dataSource.getRepository(SnapshotMeta);
    const blobRepo = this.dataSource.getRepository(SnapshotBlob);

    // 가장 최근의 메타데이터 조회
    const meta = await metaRepo.findOne({
      where: { profile },
      order: { turn_time: 'DESC' },
    });

    if (!meta) return null;

    // 블롭 데이터(청크)를 읽어서 하나로 합침
    const blobs = await blobRepo.find({
      where: { snapshot_id: meta.snapshot_id },
      order: { chunk_idx: 'ASC' },
    });

    if (blobs.length === 0) return null;

    // 현재는 단순 JSON 문자열로 가정 (Buffer -> String -> JSON)
    const fullBuffer = Buffer.concat(blobs.map((b) => b.payload));
    const snapshot = JSON.parse(fullBuffer.toString('utf-8')) as WorldSnapshot;

    return {
      snapshot,
      checksum: meta.checksum,
      version: meta.version,
    };
  }

  async saveSnapshot(params: {
    profile: string;
    snapshot: WorldSnapshot;
    checksum: string;
    version: number;
    turnTime: Date;
  }): Promise<void> {
    const snapshotId = crypto.randomUUID();
    const payload = Buffer.from(JSON.stringify(params.snapshot), 'utf-8');

    await this.dataSource.transaction(async (manager) => {
      // 1. 메타데이터 저장
      const meta = new SnapshotMeta();
      meta.snapshot_id = snapshotId;
      meta.profile = params.profile;
      meta.turn_time = params.turnTime;
      meta.checksum = params.checksum;
      meta.version = params.version;
      await manager.save(meta);

      // 2. 블롭 저장 (단일 청크로 저장, 필요 시 쪼개기 가능)
      const blob = new SnapshotBlob();
      blob.snapshot_id = snapshotId;
      blob.chunk_idx = 0;
      blob.payload = payload;
      await manager.save(blob);
    });
  }
}
