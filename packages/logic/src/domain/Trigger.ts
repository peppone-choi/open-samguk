import { RandUtil } from "@sammo/common";
import { WorldDelta } from "./entities.js";

/**
 * 트리거 실행 우선순위 정의 (값에 따라 정렬됨)
 */
export enum TriggerPriority {
  /** 가장 먼저 실행되어야 하는 핵심 로직 (보정 전) */
  PreLowest = 0,
  /** 아이템 효과 발동 */
  Item = 100,
  /** 장수 특기(Specialty) 발동 */
  Specialty = 200,
  /** 병종 특수 능력 발동 */
  Unit = 300,
  /** 데미지 계산 및 전투 종료 판정 등 */
  Core = 500,
  /** 가장 마지막에 실행되어야 하는 후처리 로직 */
  PostHighest = 1000,

  // Legacy compatibility (WarUnitTriggerRegistry)
  MIN = 0,
  BEGIN = 10000,
  PRE = 20000,
  BODY = 30000,
  POST = 40000,
  FINAL = 50000,
}

/**
 * 트리거 실행 결과
 */
export interface TriggerResult {
  delta: WorldDelta;
  /** false면 다음 트리거 실행 중단 (cascade control) */
  continueExecution: boolean;
}

/**
 * 트리거 컨텍스트
 * 트리거가 실행될 때 필요한 실행자(self), 대상(oppose), 랜덤 도구, 결과 저장소(Env) 등을 포함합니다.
 */
export interface TriggerContext {
  /** 트리거를 발동시킨 주체 (장수 등) */
  self?: any;
  /** 트리거의 영향을 받는 대상 */
  oppose?: any;
  /** 난수 생성기 */
  rand: RandUtil;
  /** 현재 턴 수 또는 전투 페이즈 */
  phase?: number;

  // Legacy compatibility
  actorId: number;
  snapshot: import("./entities.js").WorldSnapshot;
  env: Record<string, unknown>;
}

/**
 * 게임 로직 트리거 인터페이스
 * 특정 조건이 만족되었을 때 실행되는 행동 단위를 정의합니다.
 */
export interface Trigger {
  /** 트리거의 고유 식별 명칭 */
  readonly name: string;
  /** 실행 우선순위 */
  readonly priority: TriggerPriority | number;

  /**
   * 트리거가 발동될 수 있는 상황인지 사전에 검사합니다.
   * @param ctx 실행 컨텍스트
   * @returns 발동 가능 여부
   */
  attempt(ctx: TriggerContext): boolean;

  /**
   * 실제 트리거 효과를 수행하고 월드 상태 변경분(Delta)을 반환합니다.
   * @param ctx 실행 컨텍스트
   * @returns 상태 변경 정보 (Legacy: TriggerResult)
   */
  execute(ctx: TriggerContext): TriggerResult;
}

/**
 * 트리거 레지스트리
 * 우선순위에 따라 트리거를 관리하고 실행함
 */
export class TriggerRegistry {
  private triggers: Trigger[] = [];

  /**
   * 단일 트리거 등록
   */
  public register(trigger: Trigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다수 트리거 벌크 등록
   */
  public registerMany(...triggers: Trigger[]): void {
    this.triggers.push(...triggers);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다른 레지스트리와 병합
   */
  public merge(other: TriggerRegistry): void {
    this.triggers.push(...other.getTriggers());
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 등록된 모든 트리거 제거
   */
  public clear(): void {
    this.triggers = [];
  }

  /**
   * 등록된 트리거 목록 반환
   */
  public getTriggers(): readonly Trigger[] {
    return this.triggers;
  }

  /**
   * 등록된 트리거가 있는지 확인
   */
  public isEmpty(): boolean {
    return this.triggers.length === 0;
  }

  /**
   * 모든 트리거 실행 (우선순위 순서)
   * cascade control: continueExecution이 false면 중단
   * @returns 실행된 트리거들의 delta 목록
   */
  public runAll(ctx: TriggerContext): WorldDelta[] {
    const deltas: WorldDelta[] = [];
    for (const trigger of this.triggers) {
      if (trigger.attempt(ctx)) {
        const result = trigger.execute(ctx);
        deltas.push(result.delta);
        if (!result.continueExecution) {
          break;
        }
      }
    }
    return deltas;
  }
}
