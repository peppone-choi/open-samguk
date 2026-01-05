import { WorldSnapshot, WorldDelta } from "../domain/entities.js";
import { RandUtil } from "@sammo-ts/common";

/**
 * 트리거 우선순위 상수
 * 레거시 ObjectTrigger.php 참조
 * 낮을수록 우선순위가 높음 (먼저 실행)
 */
export const TriggerPriority = {
  MIN: 0,
  BEGIN: 10000,
  PRE: 20000,
  BODY: 30000,
  POST: 40000,
  FINAL: 50000,
} as const;

export type TriggerPriorityType =
  (typeof TriggerPriority)[keyof typeof TriggerPriority];

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
 */
export interface TriggerContext {
  actorId: number;
  snapshot: WorldSnapshot;
  rand: RandUtil;
  /** 트리거 간 상태 공유용 환경 객체 */
  env: Record<string, unknown>;
}

/**
 * 트리거 인터페이스 (DDD)
 * attempt: 실행 가능 여부 및 확률 판정
 * execute: 실제 상태 변경(Delta) 생성
 */
export interface Trigger {
  readonly name: string;
  readonly priority: number;

  attempt(ctx: TriggerContext): boolean;
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
