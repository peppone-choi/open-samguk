import { WorldSnapshot, WorldDelta } from "./entities.js";
import { MonthlyPipeline } from "./MonthlyPipeline.js";
import { EventRegistry, EventTarget } from "./events/types.js";
import * as MonthlyEvents from "./events/month/index.js";
import { DeltaUtil } from "../utils/DeltaUtil.js";
import { TurnProcessor } from "./TurnProcessor.js";
import { TurnExecutionPipeline } from "./TurnExecutionPipeline.js";

/**
 * 게임 엔진 핵심 클래스
 * 월간 전환(Pipeline)과 개별 장수 턴(TurnProcessor)의 실행을 총괄합니다.
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
    this.turnProcessor = new TurnProcessor("default-seed"); // TODO: 환경변수 등에서 실제 시드 로드
    this.executionPipeline = new TurnExecutionPipeline();
  }

  /**
   * 시스템에 정의된 모든 이벤트를 등록합니다.
   */
  private registerAllEvents() {
    // 모든 월간 이벤트 등록
    for (const EventClass of Object.values(MonthlyEvents)) {
      try {
        // 인자가 필요 없는 기본 이벤트만 자동 등록
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
   * 연월 변경, 세금 징수, 재해 발생 등 월간 업데이트를 수행합니다.
   *
   * @param snapshot 현재 월드 상태
   * @param now 실행 시점의 서버 시간
   * @returns 월간 전환에 따른 상태 변경 델타
   */
  public step(snapshot: WorldSnapshot, now: Date): WorldDelta {
    const timeDelta = this.pipeline.advanceTime(snapshot, now);
    const timeSnapshot = DeltaUtil.apply(snapshot, timeDelta);

    const preDelta = this.pipeline.preUpdateMonthly(timeSnapshot);
    const preSnapshot = DeltaUtil.apply(timeSnapshot, preDelta);

    const postDelta = this.pipeline.postUpdateMonthly(preSnapshot);

    let combinedDelta = DeltaUtil.merge(timeDelta, preDelta);
    combinedDelta = DeltaUtil.merge(combinedDelta, postDelta);

    return combinedDelta;
  }

  /**
   * 특정 시점(now)까지 실행되어야 할 장수들의 개인 턴을 순차적으로 처리합니다.
   *
   * @param snapshot 현재 월드 상태
   * @param now 실행 시적의 서버 시간
   * @returns 실행된 모든 장수 턴의 합산 델타
   */
  public stepGenerals(snapshot: WorldSnapshot, now: Date): WorldDelta {
    const executableIds = this.executionPipeline.findExecutableGenerals(snapshot, now);
    let combinedDelta: WorldDelta = {};

    for (const id of executableIds) {
      // 이전 장수의 행동 결과가 반영된 스냅샷 위에서 다음 장수 행동 계산
      const currentSnapshot = DeltaUtil.apply(snapshot, combinedDelta);

      // 개별 장수 턴 실행 (TurnProcessor 호출)
      const turnDelta = this.turnProcessor.processGeneralTurn(currentSnapshot, id);

      // 실행 완료 후 다음 턴 시간 갱신 (기본 1분 간격)
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
   * 현재 시점에서 월간 전환(연월 변경)이 필요한 상태인지 확인합니다.
   */
  public shouldAdvanceMonth(snapshot: WorldSnapshot, now: Date): boolean {
    return this.executionPipeline.shouldAdvanceMonth(snapshot, now);
  }

  /**
   * 현재 등록된 이벤트 레지스트리를 반환합니다.
   */
  public getRegistry(): EventRegistry {
    return this.registry;
  }
}
