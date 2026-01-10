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
 * 전투 중 발생하는 각종 효과(특기, 아이템 발동 등)들을 관리하고 실행합니다.
 * 우선순위(Priority) 기반 실행 및 연쇄 중단(Cascade Control) 기능을 지원합니다.
 * 레거시 WarUnitTriggerCaller.php의 확장 구현체입니다.
 */
export class WarUnitTriggerRegistry {
  /** 등록된 트리거 목록 */
  private triggers: WarUnitTrigger[] = [];

  /**
   * 단일 트리거를 등록합니다. 등록 후 우선순위에 따라 정렬됩니다.
   */
  public register(trigger: WarUnitTrigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다수의 트리거를 한꺼번에 등록합니다.
   */
  public registerMany(...triggers: WarUnitTrigger[]): void {
    this.triggers.push(...triggers);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 다른 레지스트리에 등록된 모든 트리거를 현재 레지스트리로 병합합니다.
   */
  public merge(other: WarUnitTriggerRegistry): void {
    this.triggers.push(...other.getTriggers());
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 등록된 모든 트리거를 제거하여 레지스트리를 초기화합니다.
   */
  public clear(): void {
    this.triggers = [];
  }

  /**
   * 현재 등록된 모든 트리거 목록을 읽기 전용으로 반환합니다.
   */
  public getTriggers(): readonly WarUnitTrigger[] {
    return this.triggers;
  }

  /**
   * 현재 등록된 트리거가 없는지 여부를 확인합니다.
   */
  public isEmpty(): boolean {
    return this.triggers.length === 0;
  }

  /**
   * 등록된 모든 트리거를 조건(attempt) 확인 후 순차적으로 실행(fire)합니다.
   * 레거시 패턴을 구현하여, 각 트리거는 자신의 유닛을 기준으로 self/oppose를 결정하고 환경 변수를 전달받습니다.
   *
   * @param attacker 공격자 유닛
   * @param defender 수비자 유닛
   * @param rand 난수 생성기
   * @param phase 현재 전투 페이즈
   * @returns 생성된 델타 목록 및 업데이트된 환경 변수, 중단 여부
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

      // 트리거를 소지한 유닛이 공격자인지 확인하여 self/oppose 관계 설정
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

      // 트리거 발동 조건(확률, 상황 등) 검사
      if (trigger.attempt(ctx)) {
        // 실제 전투 액션 수행
        const result = trigger.actionWar(ctx);
        deltas.push(result.delta);

        // 트리거 실행 후 변경된 환경 변수 반영
        if (isAttacker) {
          attackerEnv = ctx.selfEnv;
          defenderEnv = ctx.opposeEnv;
        } else {
          defenderEnv = ctx.selfEnv;
          attackerEnv = ctx.opposeEnv;
        }

        // 특정 트리거에 의해 이후 트리거 실행이 불필요한 경우(예: 전투 즉시 종료) 실행 중단
        if (!result.continueExecution) {
          stopped = true;
          break;
        }
      }
    }

    return { deltas, attackerEnv, defenderEnv, stopped };
  }
}
