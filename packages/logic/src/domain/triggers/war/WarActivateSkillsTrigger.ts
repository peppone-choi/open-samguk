import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseTypeValue,
} from "../../WarUnitTriggerRegistry.js";

export class WarActivateSkillsTrigger implements PriorityWarUnitTrigger {
  readonly name = "스킬활성화";
  readonly priority: number;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    priority: number,
    raiseType: RaiseTypeValue,
    private readonly isSelf: boolean,
    private readonly skills: string[]
  ) {
    this.priority = priority;
    this.raiseType = raiseType;
  }

  attempt(_ctx: WarUnitTriggerContext): boolean {
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const target = this.isSelf ? ctx.self : ctx.oppose;
    for (const skill of this.skills) {
      target.activateSkill(skill);
    }
    return {
      delta: {},
      continueExecution: true,
    };
  }

  static forSelf(
    unit: WarUnit,
    priority: number,
    raiseType: RaiseTypeValue,
    ...skills: string[]
  ): WarActivateSkillsTrigger {
    return new WarActivateSkillsTrigger(unit, priority, raiseType, true, skills);
  }

  static forOppose(
    unit: WarUnit,
    priority: number,
    raiseType: RaiseTypeValue,
    ...skills: string[]
  ): WarActivateSkillsTrigger {
    return new WarActivateSkillsTrigger(unit, priority, raiseType, false, skills);
  }
}
