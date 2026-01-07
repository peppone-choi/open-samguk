import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { GameConst } from "../GameConst.js";

/**
 * 대상 국가로의 임관 가능 여부 검사
 * 레거시: AllowJoinDestNation.php
 */
export class AllowJoinDestNationConstraint implements Constraint {
  name = "AllowJoinDestNation";

  constructor(private relYear: number) {}

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "destNation" as const, id: ctx.args.destNationId },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    const destNation = view.get({ kind: "destNation", id: ctx.args.destNationId });

    if (!general || !destNation) {
      return { kind: "deny", reason: "정보를 찾을 수 없습니다." };
    }

    // 초반 기간 및 장수 제한 체크
    if (
      this.relYear < GameConst.openingPartYear &&
      destNation.gennum >= GameConst.initialNationGenLimit
    ) {
      return { kind: "deny", reason: "임관이 제한되고 있습니다." };
    }

    // 국가 임관 금지 상태 체크
    if (destNation.scoutLevel === 1) {
      return { kind: "deny", reason: "임관이 금지되어 있습니다." };
    }

    // 유저장 태수국 임관 제한 (ⓤ 접두사)
    if ((general.npc ?? 0) < 2 && destNation.name.startsWith("ⓤ")) {
      return { kind: "deny", reason: "유저장은 태수국에 임관할 수 없습니다." };
    }

    // NPC 이민족 국가 임관 제한 (ⓞ 접두사)
    if (general.npc !== 9 && destNation.name.startsWith("ⓞ")) {
      return { kind: "deny", reason: "이민족 국가에 임관할 수 없습니다." };
    }

    return { kind: "allow" };
  }
}
