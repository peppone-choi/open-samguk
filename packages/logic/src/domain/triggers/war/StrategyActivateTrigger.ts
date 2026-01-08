import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 계략 발동 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_계략발동.php
 *
 * - Priority: POST + 600 (40600)
 * - 계략 스킬이 활성화되어 있으면 데미지 배수 적용
 * - selfEnv['magic']에서 계략 종류와 데미지 배수 읽기
 */
export class StrategyActivateTrigger implements WarUnitTrigger {
  readonly name = "계략발동";
  readonly priority = TriggerPriority.POST + 600;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    // 계략이 활성화되어 있지 않으면 패스
    if (!self.hasActivatedSkill("계략")) {
      return false;
    }

    // 이미 이번 페이즈에서 발동했으면 패스 (중복 방지)
    if (ctx.selfEnv["계략발동"]) {
      return false;
    }

    // magic 정보가 없으면 패스
    if (!ctx.selfEnv["magic"]) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    // 중복 발동 방지 플래그 설정
    ctx.selfEnv["계략발동"] = true;

    // 계략 정보에서 데미지 배수 추출
    const [magic, damageMultiplier] = ctx.selfEnv["magic"] as [string, number];

    // 전투력 배수 적용
    self.multiplyWarPower(damageMultiplier);

    // 전투 로그 추가
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
        skillName: magic,
        activated: true,
        damage: damageMultiplier,
      });
    }

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 ${magic} 발동! (공격력 ${damageMultiplier}배)`],
        },
      },
      continueExecution: true,
    };
  }
}
