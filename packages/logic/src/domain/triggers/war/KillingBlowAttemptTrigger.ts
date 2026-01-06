import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 필살 시도 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_필살시도.php
 *
 * - Priority: PRE + 120 (20120)
 * - RNG 확률 체크 후 '필살' 스킬 활성화
 * - 발동 시 selfEnv에 필살 정보 저장
 */
export class KillingBlowAttemptTrigger implements PriorityWarUnitTrigger {
  readonly name = "필살시도";
  readonly priority = TriggerPriority.PRE + 120;
  readonly raiseType = RaiseType.NONE;

  private readonly criticalRatio: number;

  constructor(
    public readonly unit: WarUnit,
    criticalRatio: number = 0.1,
  ) {
    this.criticalRatio = criticalRatio;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    // 이미 필살이 활성화되어 있으면 패스
    if (self.hasActivatedSkill("필살")) {
      return false;
    }

    // 필살 불가 스킬이 활성화되어 있으면 패스
    if (self.hasActivatedSkill("필살불가")) {
      return false;
    }

    // 확률 체크
    if (!ctx.rand.nextBool(this.criticalRatio)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    // 필살 스킬 활성화
    self.activateSkill("필살시도");
    self.activateSkill("필살");

    // 환경 변수에 필살 정보 저장 (발동 트리거에서 사용)
    ctx.selfEnv["필살시도"] = true;

    // 전투 로그 추가 (WarUnitGeneral인 경우)
    if ("addBattleLog" in self) {
      (
        self as {
          addBattleLog: (entry: {
            phase: number;
            type: string;
            skillName: string;
            activated: boolean;
          }) => void;
        }
      ).addBattleLog({
        phase: ctx.phase,
        type: "skill_attempt",
        skillName: "필살",
        activated: true,
      });
    }

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 필살 발동 준비!`],
        },
      },
      continueExecution: true,
    };
  }
}
