import { Injectable, Logger } from "@nestjs/common";
import type { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { GameEngine, SnapshotRepository, DeltaUtil } from "@sammo/logic";
import type { WorldSnapshot, WorldDelta } from "@sammo/logic";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class EngineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EngineService.name);
  private readonly prisma = createPrismaClient();
  private readonly engine = new GameEngine();
  private readonly repo = new SnapshotRepository(this.prisma);

  private snapshot: WorldSnapshot | null = null;
  private running = false;
  private stopping = false;
  private mainLoopPromise: Promise<void> | null = null;

  async onModuleInit() {
    this.logger.log("Starting Game Engine Service...");

    // 1. 초기 상태 로드 (메모리 우선주의)
    await this.loadInitialState();

    // 2. 메인 루프 시작
    this.startMainLoop();
  }

  async onModuleDestroy() {
    this.stopping = true;
    this.logger.log("Stopping Game Engine Service...");
    if (this.mainLoopPromise) {
      await this.mainLoopPromise;
    }
    // 종료 전 마지막 플러시
    if (this.snapshot) {
      this.logger.log("Final flush before shutdown...");
      // await this.repo.saveAll(this.snapshot); // 전체 저장? 또는 델타만?
    }
  }

  private async loadInitialState() {
    try {
      this.logger.log("Loading current world state into memory...");
      this.snapshot = await this.repo.load();
      this.logger.log(
        `State loaded: ${Object.keys(this.snapshot.generals).length} generals, ${Object.keys(this.snapshot.nations).length} nations.`
      );
    } catch (err) {
      this.logger.error("Failed to load initial state:", err);
      throw err;
    }
  }

  private startMainLoop() {
    this.mainLoopPromise = (async () => {
      const TURN_INTERVAL = 10 * 1000; // 10초마다 체크 (실제 게임은 보통 1분~1시간)

      while (!this.stopping) {
        try {
          await this.runTurnCycle();
        } catch (err) {
          this.logger.error("Error in turn cycle:", err);
        }

        // 다음 체크까지 대기
        await new Promise((resolve) => setTimeout(resolve, TURN_INTERVAL));
      }
    })();
  }

  private async runTurnCycle() {
    if (this.running || !this.snapshot) return;
    this.running = true;

    try {
      const now = new Date();
      let accumulatedDelta: WorldDelta = {};

      // 1. 장수 개별 턴 처리
      const generalDelta = this.engine.stepGenerals(this.snapshot, now);
      if (Object.keys(generalDelta).length > 0) {
        this.logger.log("Processing general turns...");
        accumulatedDelta = DeltaUtil.merge(accumulatedDelta, generalDelta);
        this.snapshot = DeltaUtil.apply(this.snapshot, generalDelta);
      }

      // 2. 월간 처리 체크
      if (this.engine.shouldAdvanceMonth(this.snapshot, now)) {
        this.logger.log(
          `Monthly transition: ${this.snapshot.gameTime.year}년 ${this.snapshot.gameTime.month}월 -> next`
        );
        const monthDelta = this.engine.step(this.snapshot);
        accumulatedDelta = DeltaUtil.merge(accumulatedDelta, monthDelta);
        this.snapshot = DeltaUtil.apply(this.snapshot, monthDelta);
      }

      // 3. 변경사항이 있으면 DB 플러시
      if (Object.keys(accumulatedDelta).length > 0) {
        await this.repo.applyDelta(accumulatedDelta);
        this.logger.log("State changes flushed to DB.");
      }
    } finally {
      this.running = false;
    }
  }
}
