import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { WorldSnapshot, WorldState, ISnapshotRepository } from '@sammo-ts/logic';
import { getDataSource, Journal, env, GeneralEntity, NationEntity, CityEntity } from '@sammo-ts/infra';
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
        messages: {},
        env: {},
        gameTime: { year: 184, month: 1 },
      } as WorldSnapshot);
    }

    // 2. 저널 재생
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

  /**
   * 관계형 테이블로 상태 플러시 (Query API 지원용)
   */
  public async flushToRelational() {
    this.logger.log('Flushing to relational tables...');
    const snapshot = this.world.getSnapshot();
    const dataSource = getDataSource();

    await dataSource.transaction(async (manager) => {
      // 1. 장수 정보 업데이트
      for (const general of Object.values(snapshot.generals)) {
        await manager.upsert(GeneralEntity, {
          id: general.id,
          name: general.name,
          owner_id: general.ownerId,
          nation_id: general.nationId,
          city_id: general.cityId,
          troop_id: general.troopId,
          gold: general.gold,
          rice: general.rice,
          leadership: general.leadership,
          leadership_exp: general.leadershipExp,
          strength: general.strength,
          strength_exp: general.strengthExp,
          intel: general.intel,
          intel_exp: general.intelExp,
          politics: general.politics,
          politics_exp: general.politicsExp,
          charm: general.charm,
          charm_exp: general.charmExp,
          injury: general.injury,
          experience: general.experience,
          dedication: general.dedication,
          officer_level: general.officerLevel,
          officer_city: general.officerCity,
          recent_war: general.recentWar,
          crew: general.crew,
          crew_type: general.crewType,
          train: general.train,
          atmos: general.atmos,
          dex: general.dex,
          age: general.age,
          born_year: general.bornYear,
          dead_year: general.deadYear,
          special: general.special,
          spec_age: general.specAge,
          special2: general.special2,
          spec_age2: general.specAge2,
          weapon: general.weapon,
          book: general.book,
          horse: general.horse,
          item: general.item,
          turn_time: general.turnTime,
          recent_war_time: general.recentWarTime,
          make_limit: general.makeLimit,
          kill_turn: general.killTurn,
          block: general.block,
          defence_train: general.defenceTrain,
          tournament_state: general.tournamentState,
          last_turn: general.lastTurn,
          meta: general.meta,
          penalty: general.penalty,
        }, ['id']);
      }

      // 2. 국가 정보 업데이트
      for (const nation of Object.values(snapshot.nations)) {
        await manager.upsert(NationEntity, {
          id: nation.id,
          name: nation.name,
          color: nation.color,
          capital_city_id: nation.capitalCityId,
          gold: nation.gold,
          rice: nation.rice,
          tech: nation.tech,
          power: nation.power,
          level: nation.level,
          type_code: nation.typeCode,
          scout_level: nation.scoutLevel,
          war_state: nation.warState,
          strategic_cmd_limit: nation.strategicCmdLimit,
          surrender_limit: nation.surrenderLimit,
          spy: nation.spy,
          meta: nation.meta,
        }, ['id']);
      }

      // 3. 도시 정보 업데이트
      for (const city of Object.values(snapshot.cities)) {
        await manager.upsert(CityEntity, {
          id: city.id,
          name: city.name,
          nation_id: city.nationId,
          level: city.level,
          supply: city.supply,
          front: city.front,
          pop: city.pop,
          pop_max: city.popMax,
          agri: city.agri,
          agri_max: city.agriMax,
          comm: city.comm,
          comm_max: city.commMax,
          secu: city.secu,
          secu_max: city.secuMax,
          def: city.def,
          def_max: city.defMax,
          wall: city.wall,
          wall_max: city.wallMax,
          trust: city.trust,
          gold: city.gold,
          rice: city.rice,
          region: city.region,
          state: city.state,
          term: city.term,
          conflict: city.conflict,
          meta: city.meta,
        }, ['id']);
      }
    });
    this.logger.log('Relational tables synced.');
  }

  public getSnapshot(): WorldSnapshot {
    return this.world.getSnapshot();
  }

  public applyDelta(delta: any) {
    this.world.applyDelta(delta);
    this.logger.debug('Delta applied to memory state');
  }
}
