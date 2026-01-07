import { Trigger, TriggerContext, TriggerResult, TriggerPriority } from "../Trigger.js";
import { JosaUtil } from "@sammo/common";

/**
 * 아이템 치료 트리거
 * 레거시: legacy/hwe/sammo/GeneralTrigger/che_아이템치료.php
 * Priority: 9990
 */
export class ItemHealTrigger implements Trigger {
  readonly name = "아이템치료";
  readonly priority = TriggerPriority.BEGIN - 10;

  private readonly injuryTarget: number;

  constructor(injuryTarget: number = 10) {
    this.injuryTarget = injuryTarget;
  }

  attempt(ctx: TriggerContext): boolean {
    const actor = ctx.snapshot.generals[ctx.actorId];
    if (!actor) return false;
    if (actor.injury < this.injuryTarget) return false;
    if (ctx.env["nextCommand"] === "요양") return false;
    if (!actor.item || !this.isHealingItem(actor.item)) return false;

    return true;
  }

  execute(ctx: TriggerContext): TriggerResult {
    const actor = ctx.snapshot.generals[ctx.actorId];
    if (!actor || !actor.item) {
      return { delta: {}, continueExecution: true };
    }

    const itemName = actor.item;
    const josaUl = JosaUtil.pick(itemName, "을");

    ctx.env["pre.부상경감"] = true;
    ctx.env["pre.치료"] = true;

    const shouldConsumeItem = this.shouldConsumeItem(actor.item, ctx);
    const generalUpdate: Record<string, unknown> = { injury: 0 };
    if (shouldConsumeItem) {
      generalUpdate.item = null;
    }

    return {
      delta: {
        generals: { [ctx.actorId]: generalUpdate },
        logs: { general: { [ctx.actorId]: [`<C>${itemName}</>${josaUl} 사용하여 치료합니다!`] } },
      },
      continueExecution: true,
    };
  }

  private isHealingItem(item: string): boolean {
    const healingItems = ["청낭서", "태평요술", "의방류취", "본초강목"];
    return healingItems.some((name) => item.includes(name));
  }

  private shouldConsumeItem(_item: string, _ctx: TriggerContext): boolean {
    return false;
  }
}
