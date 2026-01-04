import { Injectable, Logger, Inject } from '@nestjs/common';
import { TurnDaemonStatus, DaemonCommand, DaemonEvent, TurnMetrics } from './types.js';
import { JournalService } from './journal.service.js';
import { InMemoryWorldService } from './world.service.js';
import { ITurnRepository, TriggerRegistry, CommandFactory, SeedGenerator, TurnExecutionPipeline, MonthlyPipeline, SoldierMaintenanceTrigger, EventRegistry, TestPreMonthEvent } from '@sammo-ts/logic';
import { RandUtil, LiteHashDRBG } from '@sammo-ts/common';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);
  private state: 'idle' | 'running' | 'paused' | 'error' = 'idle';
  private readonly triggerRegistry = new TriggerRegistry();
  private readonly eventRegistry = new EventRegistry();
  private readonly pipeline = new TurnExecutionPipeline();
  private readonly monthlyPipeline = new MonthlyPipeline(this.eventRegistry);
  
  // Phase K3: 메트릭 상태
  private metrics: TurnMetrics = {
    lastTurnDurationMs: 0,
    queueDepth: 0,
    totalProcessedTurns: 0,
  };

  constructor(
    private readonly journalService: JournalService,
    private readonly worldService: InMemoryWorldService,
    @Inject('TURN_REPOSITORY')
    private readonly turnRepository: ITurnRepository,
  ) {
    // Phase J2 - 실제 트리거 등록
    this.triggerRegistry.register(new SoldierMaintenanceTrigger());
    // Phase 3 - 이벤트 시스템 연동
    this.eventRegistry.register(new TestPreMonthEvent());
  }

  getStatus(): TurnDaemonStatus {
    return {
      state: this.state,
      metrics: { ...this.metrics },
    };
  }

  /**
   * 외부에서 큐 길이를 업데이트할 수 있도록 허용
   */
  public updateQueueDepth(depth: number) {
    this.metrics.queueDepth = depth;
  }

  async handleCommand(command: DaemonCommand): Promise<DaemonEvent> {
    this.logger.log(`[${command.requestId}] Handling: ${command.type}`);

    switch (command.type) {
      case 'getStatus':
        return { type: 'status', status: this.getStatus(), requestId: command.requestId };
      case 'pause':
        this.state = 'paused';
        return { type: 'status', status: this.getStatus(), requestId: command.requestId };
      case 'resume':
        this.state = 'idle';
        return { type: 'status', status: this.getStatus(), requestId: command.requestId };
      case 'run':
        if (this.state === 'running') {
          return { type: 'runFailed', error: 'Already running', requestId: command.requestId };
        }
        if (this.state === 'paused') {
          return { type: 'runFailed', error: 'Engine is paused', requestId: command.requestId };
        }
        
        return this.runTurn(command);
      default:
        return { type: 'runFailed', error: 'Unknown command', requestId: command.requestId };
    }
  }

  private async runTurn(command: DaemonCommand): Promise<DaemonEvent> {
    const startTime = Date.now();
    this.state = 'running';
    this.logger.log(`[${command.requestId}] Batch turn started: ${command.reason}`);

    try {
      const snapshot = this.worldService.getSnapshot();
      const targetTime = new Date(); // 현재 시간까지의 턴 처리
      
      // 1. 실행 대상 장수 추출 (Phase 3)
      const executableIds = this.pipeline.findExecutableGenerals(snapshot, targetTime);
      this.logger.log(`[${command.requestId}] Found ${executableIds.length} executable generals`);

      for (const actorId of executableIds) {
        const currentSnapshot = this.worldService.getSnapshot();
        const actor = currentSnapshot.generals[actorId];
        
        // 2. 국가 턴 처리 (장수가 오관인 경우)
        // 레거시: officer_level이 높은 경우 국가 턴을 대행함
        if (actor && actor.nationId > 0) {
          // TODO: 실제 officerLevel 필드 엔티티에 추가 필요 (현재는 임시로 5:군주 가정)
          const officerLevel = 5; 
          const nationTurn = await this.turnRepository.getNextNationTurn(actor.nationId, officerLevel);
          
          if (nationTurn) {
            this.logger.log(`[${command.requestId}] Processing nation turn for nation ${actor.nationId} by actor ${actorId}`);
            const nationCmdObj = CommandFactory.create(nationTurn.action);
            const nSeed = SeedGenerator.fromSnapshot(currentSnapshot, actorId, `nation:${nationTurn.action}`);
            const nRand = new RandUtil(new LiteHashDRBG(nSeed));
            
            const nDelta = nationCmdObj.run(nRand, currentSnapshot, actorId, nationTurn.arg);
            this.worldService.applyDelta(nDelta);
            await this.turnRepository.consumeNationTurn(actor.nationId, officerLevel);
            
            await this.journalService.record('nation_turn_run', {
              actorId,
              nationId: actor.nationId,
              action: nationTurn.action,
              delta: nDelta,
            });
          }
        }

        // 3. 장수 개인 턴 처리
        const nextTurn = await this.turnRepository.getNextTurn(actorId);
        const action = nextTurn?.action ?? '휴식';
        const args = nextTurn?.arg ?? {};

        // 4. 결정론적 RNG 시드 생성 (레거시 규칙 적용)
        const seed = SeedGenerator.fromSnapshot(currentSnapshot, actorId, action);
        const rng = new LiteHashDRBG(seed);
        const rand = new RandUtil(rng);

        // 5. 트리거 실행
        const triggerDeltas = this.triggerRegistry.runAll({ actorId, snapshot: currentSnapshot, rand });
        
        // 6. 실제 커맨드 실행
        const commandObj = CommandFactory.create(action);
        
        // 6-1. 제약 조건 검사 (Phase J1)
        const checkResult = commandObj.checkConstraints(rand, currentSnapshot, actorId, args, 'full');

        let commandDelta = {};
        if (checkResult.kind === 'allow') {
          commandDelta = commandObj.run(rand, currentSnapshot, actorId, args);
        } else {
          // 제약 조건 미달 시 휴식으로 대체 (레거시 규칙)
          commandDelta = CommandFactory.create('휴식').run(rand, currentSnapshot, actorId, {});
        }

        // 7. 메모리 상태 갱신 (즉시 반영)
        this.worldService.applyDelta(commandDelta);
        for (const tDelta of triggerDeltas) {
          this.worldService.applyDelta(tDelta);
        }
        
        // 8. 예약된 턴 소비
        if (nextTurn) {
          await this.turnRepository.consumeTurn(actorId);
        }

        // 9. 저널 기록
        await this.journalService.record('turn_run', {
          command,
          actorId,
          action,
          delta: { commandDelta, triggerDeltas },
          timestamp: new Date().toISOString(),
        });
      }

      // 10. 월간 처리 (Phase 3: Monthly Update Pipeline)
      const afterTurnsSnapshot = this.worldService.getSnapshot();
      if (this.pipeline.shouldAdvanceMonth(afterTurnsSnapshot, targetTime)) {
        this.logger.log(`[${command.requestId}] Advancing month...`);

        // 10-1. 월간 전처리
        const preDelta = this.monthlyPipeline.preUpdateMonthly(afterTurnsSnapshot);
        this.worldService.applyDelta(preDelta);

        // 10-2. 시간 전진
        const timeDelta = this.monthlyPipeline.advanceTime(afterTurnsSnapshot);
        this.worldService.applyDelta(timeDelta);

        // 10-3. 월간 후처리
        const currentSnapshot = this.worldService.getSnapshot();
        const postDelta = this.monthlyPipeline.postUpdateMonthly(currentSnapshot);
        this.worldService.applyDelta(postDelta);

        // 저널 기록
        await this.journalService.record('monthly_update', {
          gameTime: currentSnapshot.gameTime,
          deltas: { preDelta, timeDelta, postDelta },
          timestamp: new Date().toISOString(),
        });
      }

      // 11. Phase H2: 주기적 스냅샷 저장
      await this.worldService.saveSnapshot(new Date());

      this.state = 'idle';
      const duration = Date.now() - startTime;
      
      // 메트릭 업데이트
      this.metrics.lastTurnDurationMs = duration;
      this.metrics.totalProcessedTurns += 1;

      this.logger.log(`[${command.requestId}] Turn completed in ${duration}ms`);
      return { type: 'runCompleted', requestId: command.requestId };
    } catch (e) {
      this.state = 'error';
      const error = e instanceof Error ? e.message : String(e);
      this.logger.error(`[${command.requestId}] Turn failed: ${error}`);
      return { type: 'runFailed', error, requestId: command.requestId };
    }
  }
}