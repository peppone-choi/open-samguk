import {
  Trigger,
  TriggerContext,
  TriggerResult,
  TriggerPriority,
} from "../Trigger.js";

/**
 * 부상 경감 트리거
 * 레거시: legacy/hwe/sammo/GeneralTrigger/che_부상경감.php
 * 턴마다 부상 수치를 10씩 감소시킴
 */
export class InjuryReductionTrigger implements Trigger {
  readonly name = "부상경감";
  readonly priority = TriggerPriority.BEGIN + 10;

  private readonly reductionAmount: number;

  constructor(reductionAmount: number = 10) {
    this.reductionAmount = reductionAmount;
  }

  attempt(ctx: TriggerContext): boolean {
    const actor = ctx.snapshot.generals[ctx.actorId];
    if (!actor) return false;

    // 부상이 있고, 이미 이번 턴에 부상경감이 발동하지 않았을 때만 시도
    if (actor.injury <= 0) return false;
    if (ctx.env["pre.부상경감"]) return false;

    return true;
  }

  execute(ctx: TriggerContext): TriggerResult {
    const actor = ctx.snapshot.generals[ctx.actorId];
    if (!actor) {
      return { delta: {}, continueExecution: true };
    }

    // 스킬 발동 플래그 설정
    ctx.env["pre.부상경감"] = true;

    const newInjury = Math.max(0, actor.injury - this.reductionAmount);
    const reduced = actor.injury - newInjury;

    if (reduced <= 0) {
      return { delta: {}, continueExecution: true };
    }

    return {
      delta: {
        generals: {
          [ctx.actorId]: {
            injury: newInjury,
          },
        },
        logs: {
          general: {
            [ctx.actorId]: [
              `부상이 ${reduced}만큼 회복되었습니다. (${actor.injury} → ${newInjury})`,
            ],
          },
        },
      },
      continueExecution: true,
    };
  }
}
