import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 반란 가능 여부 확인
 * 레거시: AllowRebellion.php
 */
export class AllowRebellionConstraint implements Constraint {
  name = "AllowRebellion";

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "nation" as const, id: ctx.nationId ?? 0 },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });

    if (!general || !nation) {
      return { kind: "deny", reason: "정보를 찾을 수 없습니다." };
    }

    if (nation.id === 0) {
      return { kind: "deny", reason: "재야 상태에서는 반란을 일으킬 수 없습니다." };
    }

    const lord = view.get({ kind: "general", id: nation.chiefGeneralId });
    if (!lord) {
      return { kind: "deny", reason: "군주 정보를 찾을 수 없습니다." };
    }

    if (lord.id === general.id) {
      return { kind: "deny", reason: "이미 군주입니다." };
    }

    // 군주가 활동중인지 체크 (killturn >= env.killturn)
    const envKillTurn = (ctx.env as any).killturn ?? 0;
    if (lord.killTurn >= envKillTurn) {
      return { kind: "deny", reason: "군주가 활동중입니다." };
    }

    // 군주가 특정 NPC 타입이면 반란 불가 (2: 일반NPC, 3: 수뇌NPC, 6: 거상/거한, 9: 이민족)
    if ([2, 3, 6, 9].includes(lord.npc)) {
      return { kind: "deny", reason: "군주가 NPC입니다." };
    }

    return { kind: "allow" };
  }
}
