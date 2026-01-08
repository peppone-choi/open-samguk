import { RandUtil } from "@sammo/common";
import type { WorldDelta } from "./entities.js";
import type {
  WarUnit,
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseTypeValue,
} from "./specials/types.js";
import { TriggerPriority } from "./Trigger.js";

// Re-export for convenience
export { TriggerPriority };
export {
  RaiseType,
  type WarUnitTrigger,
  type WarUnitTriggerContext,
  type WarUnitTriggerResult,
  type RaiseTypeValue,
} from "./specials/types.js";

/**
 * 전투 트리거 레지스트리
 * 우선순위 기반 실행 및 cascade control 지원
 * 레거시 WarUnitTriggerCaller.php 확장판
 */
export class WarUnitTriggerRegistry {
  private triggers: WarUnitTrigger[] = [];

  /**
   * 단일 트리거 등록
   */
  public register(trigger: WarUnitTrigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다수 트리거 벌크 등록
   */
  public registerMany(...triggers: WarUnitTrigger[]): void {
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
  public getTriggers(): readonly WarUnitTrigger[] {
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
    phase: number = 0
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
