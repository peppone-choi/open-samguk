import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 회피 시도 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_회피시도.php
 *
 * - Priority: PRE + 200 (20200)
 * - RNG 확률 체크 후 '회피' 스킬 활성화
 * - 발동 시 selfEnv에 회피 정보 저장
 */
export class EvasionAttemptTrigger implements PriorityWarUnitTrigger {
  readonly name = "회피시도";
  readonly priority = TriggerPriority.PRE + 200;
  readonly raiseType = RaiseType.NONE;

  private readonly avoidRatio: number;

  constructor(
    public readonly unit: WarUnit,
    avoidRatio: number = 0.1
  ) {
    this.avoidRatio = avoidRatio;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    // 이미 특수 스킬이 활성화되어 있으면 패스
    if (self.hasActivatedSkill("특수")) {
      return false;
    }

    // 회피불가 스킬이 활성화되어 있으면 패스
    if (self.hasActivatedSkill("회피불가")) {
      return false;
    }

    // 이미 회피가 활성화되어 있으면 패스
    if (self.hasActivatedSkill("회피")) {
      return false;
    }

    // 확률 체크
    if (!ctx.rand.nextBool(this.avoidRatio)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    // 회피 스킬 활성화
    self.activateSkill("회피시도");
    self.activateSkill("회피");

    // 환경 변수에 회피 정보 저장 (발동 트리거에서 사용)
    ctx.selfEnv["회피시도"] = true;

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
        skillName: "회피",
        activated: true,
      });
    }

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 회피 준비!`],
        },
      },
      continueExecution: true,
    };
  }
}
