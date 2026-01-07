import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 회피 발동 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_회피발동.php
 *
 * - Priority: POST + 500 (40500)
 * - 회피 스킬이 활성화되어 있으면 상대 데미지를 1/6으로 감소
 * - 중복 발동 방지
 */
export class EvasionActivateTrigger implements PriorityWarUnitTrigger {
  readonly name = "회피발동";
  readonly priority = TriggerPriority.POST + 500;
  readonly raiseType = RaiseType.NONE;

  private readonly damageReductionMultiplier: number;

  constructor(
    public readonly unit: WarUnit,
    damageReductionMultiplier: number = 1 / 6
  ) {
    this.damageReductionMultiplier = damageReductionMultiplier;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    // 회피가 활성화되어 있지 않으면 패스
    if (!self.hasActivatedSkill("회피")) {
      return false;
    }

    // 이미 이번 페이즈에서 발동했으면 패스 (중복 방지)
    if (ctx.selfEnv["회피발동"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    // 중복 발동 방지 플래그 설정
    ctx.selfEnv["회피발동"] = true;

    // 상대 전투력 감소 적용 (회피 시 상대 공격력 1/6)
    oppose.multiplyWarPower(this.damageReductionMultiplier);

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
        type: "skill_activate",
        skillName: "회피",
        activated: true,
      });
    }

    return {
      delta: {
        logs: {
          general: {
            [self.general.id]: ["회피했다!"],
          },
          global: [`${self.general.name}가 회피했다! (상대 공격력 감소)`],
        },
      },
      continueExecution: true,
    };
  }
}
