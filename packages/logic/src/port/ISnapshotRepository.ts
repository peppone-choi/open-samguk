import { WorldSnapshot } from '../domain/entities.js';

/**
 * 스냅샷 레포지토리 인터페이스 (Port)
 * DDD: 엔진의 전체 상태를 영속화하고 복구하는 기능을 추상화함
 */
export interface ISnapshotRepository {
  /**
   * 최신 스냅샷 가져오기
   */
  getLatestSnapshot(profile: string): Promise<{
    snapshot: WorldSnapshot;
    checksum: string;
    version: number;
  } | null>;

  /**
   * 스냅샷 저장
   */
  saveSnapshot(params: {
    profile: string;
    snapshot: WorldSnapshot;
    checksum: string;
    version: number;
    turnTime: Date;
  }): Promise<void>;
}
