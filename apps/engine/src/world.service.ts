import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { WorldSnapshot, WorldState, ISnapshotRepository } from '@sammo-ts/logic';
import { getDataSource, Journal, env } from '@sammo-ts/infra';
import { MoreThan } from 'typeorm';

/**
 * 인메모리 월드 서비스
 * 엔진의 단일 권위 상태(Source of Truth)를 소유함
 */
@Injectable()
export class InMemoryWorldService implements OnModuleInit {
  private readonly logger = new Logger(InMemoryWorldService.name);
  private world!: WorldState;

  constructor(
    @Inject('SNAPSHOT_REPOSITORY')
    private readonly snapshotRepository: ISnapshotRepository,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing InMemoryWorld...');
    await this.restoreFromPersistence();
  }

  /**
   * DB(스냅샷 + 저널)로부터 상태 복구
   */
  private async restoreFromPersistence() {
    this.logger.log(`Restoring state for profile: ${env.PROFILE}`);
    
    // 1. 최신 스냅샷 로드
    const snapshotData = await this.snapshotRepository.getLatestSnapshot(env.PROFILE);
    
    if (snapshotData) {
      this.logger.log('Latest snapshot found. Restoring...');
      this.world = new WorldState(snapshotData.snapshot);
    } else {
      this.logger.warn('No snapshot found. Starting from scratch.');
      this.world = new WorldState({
        generals: {},
        nations: {},
        cities: {},
        diplomacy: {},
        troops: {},
        env: {},
        gameTime: { year: 184, month: 1 },
      });
    }

    // 2. 저널 재생
    // TODO: 스냅샷 시점 이후의 저널만 가져오도록 쿼리 최적화 필요
    const dataSource = getDataSource();
    const journals = await dataSource.getRepository(Journal).find({
      where: { profile: env.PROFILE },
      order: { seq: 'ASC' },
    });

    this.logger.log(`Replaying ${journals.length} journals...`);
    for (const journal of journals) {
      this.world.applyJournal(journal);
    }
    
    this.logger.log('World state restored.');
  }

  /**
   * 스냅샷 저장 트리거
   */
  public async saveSnapshot(turnTime: Date) {
    this.logger.log('Saving snapshot...');
    await this.snapshotRepository.saveSnapshot({
      profile: env.PROFILE,
      snapshot: this.world.getSnapshot(),
      checksum: 'fixed-checksum', // TODO: 체크섬 계산 로직
      version: 1,
      turnTime,
    });
  }

  public getSnapshot(): WorldSnapshot {
    return this.world.getSnapshot();
  }

  public applyDelta(delta: any) {
    this.world.applyDelta(delta);
    this.logger.debug('Delta applied to memory state');
  }
}
