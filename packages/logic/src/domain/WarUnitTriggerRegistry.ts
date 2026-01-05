import { RandUtil } from "@sammo-ts/common";
import type { WorldDelta } from "./entities.js";
import type { WarUnit } from "./specials/types.js";
import { TriggerPriority } from "./Trigger.js";

// Re-export for convenience
export { TriggerPriority };

/**
 * 전투 트리거 컨텍스트
 * 레거시 BaseWarUnitTrigger.php의 actionWar 매개변수 참조
 */
export interface WarUnitTriggerContext {
  /** 트리거 소유 유닛 (자신) */
  self: WarUnit;
  /** 상대 유닛 */
  oppose: WarUnit;
  /** RNG 인스턴스 */
  rand: RandUtil;
  /** 자신측 환경 변수 (트리거 간 상태 공유) */
  selfEnv: Record<string, unknown>;
  /** 상대측 환경 변수 */
  opposeEnv: Record<string, unknown>;
  /** 현재 전투 페이즈 */
  phase: number;
  /** 공격측 여부 */
  isAttacker: boolean;
}

/**
 * 전투 트리거 실행 결과
 */
export interface WarUnitTriggerResult {
  /** 상태 변경 델타 */
  delta: WorldDelta;
  /** false면 다음 트리거 실행 중단 (cascade control) */
  continueExecution: boolean;
}

/**
 * 트리거 발동 유형
 * 레거시 BaseWarUnitTrigger.php의 TYPE_* 상수 참조
 */
export const RaiseType = {
  NONE: 0,
  ITEM: 1,
  CONSUMABLE_ITEM: 3, // 1 | 2
} as const;

export type RaiseTypeValue = (typeof RaiseType)[keyof typeof RaiseType];

/**
 * 우선순위 기반 전투 트리거 인터페이스
 * attempt/actionWar 2단계 분리 패턴
 */
export interface PriorityWarUnitTrigger {
  readonly name: string;
  readonly priority: number;
  readonly raiseType: RaiseTypeValue;
  /** 트리거 소유 유닛 */
  readonly unit: WarUnit;

  /**
   * 트리거 실행 가능 여부 판정
   * RNG 확률 체크 및 조건 검사
   */
  attempt(ctx: WarUnitTriggerContext): boolean;

  /**
   * 트리거 실행
   * 스킬 활성화, 데미지 적용 등
   */
  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult;
}

/**
 * 전투 트리거 레지스트리
 * 우선순위 기반 실행 및 cascade control 지원
 * 레거시 WarUnitTriggerCaller.php 확장판
 */
export class WarUnitTriggerRegistry {
  private triggers: PriorityWarUnitTrigger[] = [];

  /**
   * 단일 트리거 등록
   */
  public register(trigger: PriorityWarUnitTrigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다수 트리거 벌크 등록
   */
  public registerMany(...triggers: PriorityWarUnitTrigger[]): void {
    this.triggers.push(...triggers);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다른 레지스트리와 병합
   */
  public merge(other: WarUnitTriggerRegistry): void {
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
  public getTriggers(): readonly PriorityWarUnitTrigger[] {
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
   * 레거시 BaseWarUnitTrigger.php의 action() 패턴 구현:
   * - 각 트리거가 자신의 유닛을 기준으로 self/oppose 결정
   * - selfEnv/opposeEnv로 환경 변수 전달
   * - cascade control (continueExecution: false 시 중단)
   */
  public fire(
    attacker: WarUnit,
    defender: WarUnit,
    rand: RandUtil,
    phase: number = 0,
  ): {
    deltas: WorldDelta[];
    attackerEnv: Record<string, unknown>;
    defenderEnv: Record<string, unknown>;
    stopped: boolean;
  } {
    const deltas: WorldDelta[] = [];
    let attackerEnv: Record<string, unknown> = {};
    let defenderEnv: Record<string, unknown> = {};
    let stopped = false;

    for (const trigger of this.triggers) {
      if (stopped) break;

      // 트리거 소유 유닛 기준으로 self/oppose 결정
      const isAttacker = trigger.unit === attacker;
      const self = isAttacker ? attacker : defender;
      const oppose = isAttacker ? defender : attacker;
      const selfEnv = isAttacker ? attackerEnv : defenderEnv;
      const opposeEnv = isAttacker ? defenderEnv : attackerEnv;

      const ctx: WarUnitTriggerContext = {
        self,
        oppose,
        rand,
        selfEnv,
        opposeEnv,
        phase,
        isAttacker,
      };

      if (trigger.attempt(ctx)) {
        const result = trigger.actionWar(ctx);
        deltas.push(result.delta);

        // 환경 변수 업데이트
        if (isAttacker) {
          attackerEnv = ctx.selfEnv;
          defenderEnv = ctx.opposeEnv;
        } else {
          defenderEnv = ctx.selfEnv;
          attackerEnv = ctx.opposeEnv;
        }

        if (!result.continueExecution) {
          stopped = true;
          break;
        }
      }
    }

    return { deltas, attackerEnv, defenderEnv, stopped };
  }
}
