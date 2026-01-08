import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 필살 발동 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_필살발동.php
 *
 * - Priority: POST + 400 (40400)
 * - 필살 스킬이 활성화되어 있으면 데미지 배수 적용
 * - 중복 발동 방지
 */
export class KillingBlowActivateTrigger implements WarUnitTrigger {
  readonly name = "필살발동";
  readonly priority = TriggerPriority.POST + 400;
  readonly raiseType = RaiseType.NONE;

  private readonly criticalDamageMultiplier: number;

  constructor(
    public readonly unit: WarUnit,
    criticalDamageMultiplier: number = 1.5
  ) {
    this.criticalDamageMultiplier = criticalDamageMultiplier;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    // 필살이 활성화되어 있지 않으면 패스
    if (!self.hasActivatedSkill("필살")) {
      return false;
    }

    // 이미 이번 페이즈에서 발동했으면 패스 (중복 방지)
    if (ctx.selfEnv["필살발동"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    // 중복 발동 방지 플래그 설정
    ctx.selfEnv["필살발동"] = true;

    // 전투력 배수 적용
    self.multiplyWarPower(this.criticalDamageMultiplier);

    // 전투 로그 추가 (WarUnitGeneral인 경우)
    if ("addBattleLog" in self) {
      (
        self as {
          addBattleLog: (entry: {
            phase: number;
            type: string;
            skillName: string;
            activated: boolean;
            damage: number;
          }) => void;
        }
      ).addBattleLog({
        phase: ctx.phase,
        type: "skill_activate",
        skillName: "필살",
        activated: true,
        damage: this.criticalDamageMultiplier,
      });
    }

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 필살 발동! (공격력 ${this.criticalDamageMultiplier}배)`],
        },
      },
      continueExecution: true,
    };
  }
}
