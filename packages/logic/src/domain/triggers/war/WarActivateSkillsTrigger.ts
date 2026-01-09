import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 단순 보조 스킬 활성화 트리거
 * 본인 또는 상대방에게 하나 이상의 보조 스킬(상태)을 부여함
 */
export class WarActivateSkillsTrigger implements WarUnitTrigger {
  readonly name = "스킬발동";
  readonly priority = TriggerPriority.BEGIN + 500;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE,
    private readonly onOpponent: boolean = false,
    private readonly skills: string[] = []
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const target = this.onOpponent ? ctx.oppose : ctx.self;

    // 유닛인 경우에만 스킬 활성화 여부 확인
    if ("hasActivatedSkill" in target) {
      const allActivated = this.skills.every((skill) => (target as any).hasActivatedSkill(skill));
      if (allActivated) return false;
    }

    // 첫 페이즈에만 발동하는 보조 효과라 가정
    if (ctx.phase !== 0) return false;

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const target = this.onOpponent ? ctx.oppose : ctx.self;

    if ("activateSkill" in target) {
      for (const skill of this.skills) {
        (target as any).activateSkill(skill);
      }
    }

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
