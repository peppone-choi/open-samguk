import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 계략 실패 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_계략실패.php
 *
 * - Priority: POST + 610 (40610)
 * - 계략실패 스킬이 활성화되어 있으면 실패 데미지 배수 적용 (상대에게 약간의 이득)
 * - selfEnv['magic']에서 계략 종류와 실패 데미지 배수 읽기
 */
export class StrategyFailTrigger implements PriorityWarUnitTrigger {
  readonly name = "계략실패";
  readonly priority = TriggerPriority.POST + 610;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    // 계략실패가 활성화되어 있지 않으면 패스
    if (!self.hasActivatedSkill("계략실패")) {
      return false;
    }

    // 이미 이번 페이즈에서 발동했으면 패스 (중복 방지)
    if (ctx.selfEnv["계략실패처리"]) {
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
    ctx.selfEnv["계략실패처리"] = true;

    // 계략 정보에서 실패 데미지 배수 추출
    const [magic, failDamageMultiplier] = ctx.selfEnv["magic"] as [string, number];

    // 실패한 계략은 상대에게 약간의 보너스 (자신의 전투력 소폭 증가)
    // 레거시에서는 실패 시에도 일부 데미지 배수가 적용됨 (실패 페널티가 아닌 약한 성공)
    self.multiplyWarPower(failDamageMultiplier);

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
        type: "skill_fail",
        skillName: magic,
        activated: false,
        damage: failDamageMultiplier,
      });
    }

    return {
      delta: {
        logs: {
          global: [
            `${self.general.name}의 ${magic} 계략이 실패했다! (약한 효과 ${failDamageMultiplier}배)`,
          ],
        },
      },
      continueExecution: true,
    };
  }
}
