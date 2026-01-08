import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 전멸 시 페이즈 증가 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_전멸시페이즈증가.php
 *
 * - Priority: POST + 800 (40800)
 * - 상대 전멸(phase === 0) 시 추가 페이즈 획득
 */
export class AnnihilationPhaseBoostTrigger implements WarUnitTrigger {
  readonly name = "전멸시페이즈증가";
  readonly priority = TriggerPriority.POST + 800;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  attempt(ctx: WarUnitTriggerContext): boolean {
    return ctx.self.phase !== 0 && ctx.oppose.phase === 0;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    ctx.selfEnv["bonusPhase"] = ((ctx.selfEnv["bonusPhase"] as number) || 0) + 1;

    return {
      delta: {
        logs: {
          global: [`적군의 전멸에 ${ctx.self.general.name}의 진격이 이어집니다!`],
        },
      },
      continueExecution: true,
    };
  }
}
