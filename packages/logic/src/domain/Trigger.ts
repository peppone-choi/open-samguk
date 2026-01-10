/**
 * @fileoverview 트리거 시스템 핵심 정의
 *
 * 트리거는 특정 조건에서 자동으로 실행되는 로직입니다.
 * 주로 전투 중 스킬 발동, 턴 시작/종료 시 효과 등에 사용됩니다.
 *
 * 트리거 실행 흐름:
 * 1. attempt(): 발동 조건 및 확률 판정
 * 2. execute(): 조건 충족 시 실제 효과 적용
 *
 * @example
 * ```typescript
 * // 전투 트리거 예시 - 필살기 발동
 * class KillingBlowTrigger implements Trigger {
 *   name = '필살';
 *   priority = TriggerPriority.BODY;
 *
 *   attempt(ctx) {
 *     // 30% 확률로 발동
 *     return ctx.rand.chance(0.3);
 *   }
 *
 *   execute(ctx) {
 *     // 데미지 2배
 *     return {
 *       delta: { ... },
 *       continueExecution: true
 *     };
 *   }
 * }
 * ```
 */

import { WorldSnapshot, WorldDelta } from "../domain/entities.js";
import { RandUtil } from "@sammo/common";

/**
 * 트리거 우선순위 상수
 *
 * 숫자가 작을수록 먼저 실행됩니다.
 * 레거시 PHP의 ObjectTrigger.php 참조.
 *
 * @example
 * BEGIN(10000) → PRE(20000) → BODY(30000) → POST(40000) → FINAL(50000)
 */
export const TriggerPriority = {
  /** 최소값 (특수 용도) */
  MIN: 0,
  /** 시작 단계 - 초기화, 버프 적용 */
  BEGIN: 10000,
  /** 사전 단계 - 선제공격, 회피 판정 */
  PRE: 20000,
  /** 본체 단계 - 메인 데미지 계산 */
  BODY: 30000,
  /** 사후 단계 - 추가 효과, 반격 */
  POST: 40000,
  /** 최종 단계 - 정산, 결과 확정 */
  FINAL: 50000,
} as const;

export type TriggerPriorityType = (typeof TriggerPriority)[keyof typeof TriggerPriority];

/**
 * 트리거 실행 결과
 */
export interface TriggerResult {
  /** 상태 변경 델타 */
  delta: WorldDelta;
  /**
   * 후속 트리거 실행 여부
   * false면 이후 트리거 실행 중단 (cascade control)
   */
  continueExecution: boolean;
}

/**
 * 트리거 실행 컨텍스트
 *
 * 트리거가 실행될 때 필요한 모든 정보를 담고 있습니다.
 */
export interface TriggerContext {
  /** 행위자 ID */
  actorId: number;
  /** 현재 게임 상태 스냅샷 */
  snapshot: WorldSnapshot;
  /** 결정론적 난수 생성기 */
  rand: RandUtil;
  /**
   * 트리거 간 상태 공유용 환경 객체
   * 예: 이전 트리거에서 계산한 데미지 배율 등
   */
  env: Record<string, unknown>;
}

/**
 * 트리거 인터페이스
 *
 * 모든 트리거가 구현해야 하는 계약입니다.
 * DDD(Domain-Driven Design) 패턴을 따릅니다.
 */
export interface Trigger {
  /** 트리거 이름 (디버깅/로깅용) */
  readonly name: string;
  /** 실행 우선순위 (낮을수록 먼저 실행) */
  readonly priority: number;

  /**
   * 발동 조건 판정
   * @returns true면 execute() 호출, false면 스킵
   */
  attempt(ctx: TriggerContext): boolean;

  /**
   * 실제 효과 적용
   * @returns 상태 변경 델타와 후속 실행 여부
   */
  execute(ctx: TriggerContext): TriggerResult;
}

/**
 * 트리거 레지스트리
 *
 * 트리거들을 우선순위에 따라 관리하고 순차 실행합니다.
 * 전투 시스템, 턴 처리 등에서 사용됩니다.
 *
 * @example
 * ```typescript
 * const registry = new TriggerRegistry();
 * registry.register(new KillingBlowTrigger());
 * registry.register(new EvasionTrigger());
 *
 * // 모든 트리거 실행
 * const deltas = registry.runAll(ctx);
 * ```
 */
export class TriggerRegistry {
  private triggers: Trigger[] = [];

  /**
   * 단일 트리거 등록
   * 등록 후 우선순위에 따라 자동 정렬됩니다.
   */
  public register(trigger: Trigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다수 트리거 한번에 등록
   */
  public registerMany(...triggers: Trigger[]): void {
    this.triggers.push(...triggers);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다른 레지스트리의 트리거들을 병합
   */
  public merge(other: TriggerRegistry): void {
    this.triggers.push(...other.getTriggers());
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 모든 트리거 제거
   */
  public clear(): void {
    this.triggers = [];
  }

  /**
   * 등록된 트리거 목록 반환 (읽기 전용)
   */
  public getTriggers(): readonly Trigger[] {
    return this.triggers;
  }

  /**
   * 트리거 등록 여부 확인
   */
  public isEmpty(): boolean {
    return this.triggers.length === 0;
  }

  /**
   * 모든 트리거 순차 실행
   *
   * 우선순위 순서대로 실행하며, continueExecution이
   * false인 트리거가 있으면 이후 실행을 중단합니다.
   *
   * @param ctx 트리거 실행 컨텍스트
   * @returns 실행된 트리거들의 델타 배열
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
