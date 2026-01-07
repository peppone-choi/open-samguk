import { Trigger, TriggerContext, TriggerResult, TriggerPriority } from "../Trigger.js";

/**
 * 병력 유지비 소모 트리거
 * 레거시 규칙: 턴마다 병력 수에 비례하여 쌀 소모
 */
export class SoldierMaintenanceTrigger implements Trigger {
  readonly name = "병력유지비소모";
  readonly priority = TriggerPriority.BEGIN + 10; // 높은 우선순위

  attempt(ctx: TriggerContext): boolean {
    const actor = ctx.snapshot.generals[ctx.actorId];
    // 병력이 있는 경우에만 시도
    return actor !== undefined && actor.crew > 0;
  }

  execute(ctx: TriggerContext): TriggerResult {
    const actor = ctx.snapshot.generals[ctx.actorId];
    if (!actor) return { delta: {}, continueExecution: true };

    // 유지비 계산 (병력 100명당 쌀 1 소모, 최소 1)
    const costRice = Math.max(Math.floor(actor.crew / 100), 1);

    if (actor.rice >= costRice) {
      // 쌀 충분: 소모만 발생
      return {
        delta: {
          generals: {
            [ctx.actorId]: {
              rice: actor.rice - costRice,
            },
          },
          logs: {
            general: {
              [ctx.actorId]: [`유지비로 쌀 ${costRice}을 소모했습니다.`],
            },
          },
        },
        continueExecution: true,
      };
    } else {
      // 쌀 부족: 병력 감소 (탈영)
      const desertion = Math.floor(actor.crew * 0.1); // 10% 탈영
      return {
        delta: {
          generals: {
            [ctx.actorId]: {
              rice: 0,
              crew: Math.max(actor.crew - desertion, 0),
            },
          },
          logs: {
            general: {
              [ctx.actorId]: ["군량이 부족하여 병사들이 탈영했습니다!"],
            },
          },
        },
        continueExecution: true,
      };
    }
  }
}
