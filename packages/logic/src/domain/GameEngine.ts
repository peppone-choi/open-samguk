import { WorldSnapshot, WorldDelta } from "./entities.js";
import { MonthlyPipeline } from "./MonthlyPipeline.js";
import { EventRegistry, EventTarget } from "./events/types.js";
import * as MonthlyEvents from "./events/month/index.js";
import { DeltaUtil } from "../utils/DeltaUtil.js";
import { TurnProcessor } from "./TurnProcessor.js";
import { TurnExecutionPipeline } from "./TurnExecutionPipeline.js";

/**
 * 게임 엔진 핵심 클래스
 */
export class GameEngine {
  private pipeline: MonthlyPipeline;
  private registry: EventRegistry;
  private turnProcessor: TurnProcessor;
  private executionPipeline: TurnExecutionPipeline;

  constructor() {
    this.registry = new EventRegistry();
    this.registerAllEvents();
    this.pipeline = new MonthlyPipeline(this.registry);
    this.turnProcessor = new TurnProcessor("default-seed"); // TODO: 환경변수 등에서 로드
    this.executionPipeline = new TurnExecutionPipeline();
  }

  private registerAllEvents() {
    // 모든 월간 이벤트 등록
    for (const EventClass of Object.values(MonthlyEvents)) {
      try {
        // 인자가 필요 없는 이벤트만 자동 등록 (나머지는 시나리오 등에서 동적 등록)
        if (EventClass.length === 0) {
          this.registry.register(new (EventClass as any)());
        }
      } catch (e) {
        console.warn(`이벤트 등록 실패: ${EventClass.name}`, e);
      }
    }
  }

  /**
   * 1턴(1개월)을 진행합니다.
   */
  public step(snapshot: WorldSnapshot): WorldDelta {
    // ... (existing monthly step)
    const timeDelta = this.pipeline.advanceTime(snapshot);
    const timeSnapshot = DeltaUtil.apply(snapshot, timeDelta);

    const preDelta = this.pipeline.preUpdateMonthly(timeSnapshot);
    const preSnapshot = DeltaUtil.apply(timeSnapshot, preDelta);

    const postDelta = this.pipeline.postUpdateMonthly(preSnapshot);

    let combinedDelta = DeltaUtil.merge(timeDelta, preDelta);
    combinedDelta = DeltaUtil.merge(combinedDelta, postDelta);

    return combinedDelta;
  }

  /**
   * 특정 시점(now)까지 실행되어야 할 장수들의 턴을 개별적으로 처리합니다.
   */
  public stepGenerals(snapshot: WorldSnapshot, now: Date): WorldDelta {
    const executableIds = this.executionPipeline.findExecutableGenerals(snapshot, now);
    let combinedDelta: WorldDelta = {};

    for (const id of executableIds) {
      // 현재까지 누적된 변경사항이 반영된 임시 스냅샷 생성
      const currentSnapshot = DeltaUtil.apply(snapshot, combinedDelta);

      // 장수 턴 실행
      const turnDelta = this.turnProcessor.processGeneralTurn(currentSnapshot, id);

      // 턴 실행 후 다음 턴 시간 갱신 (예: 1분 뒤)
      const nextTurnTime = new Date(currentSnapshot.generals[id].turnTime.getTime() + 60 * 1000);
      const timeUpdateDelta: WorldDelta = {
        generals: { [id]: { turnTime: nextTurnTime } },
      };

      const mergedTurnDelta = DeltaUtil.merge(turnDelta, timeUpdateDelta);
      combinedDelta = DeltaUtil.merge(combinedDelta, mergedTurnDelta);
    }

    return combinedDelta;
  }

  /**
   * 월간 전환이 필요한지 확인합니다.
   */
  public shouldAdvanceMonth(snapshot: WorldSnapshot, now: Date): boolean {
    return this.executionPipeline.shouldAdvanceMonth(snapshot, now);
  }

  public getRegistry(): EventRegistry {
    return this.registry;
  }
}
