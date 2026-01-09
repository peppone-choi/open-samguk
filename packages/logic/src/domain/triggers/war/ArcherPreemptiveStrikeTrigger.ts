import { type WarUnit, isWarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
} from "../../WarUnitTriggerRegistry.js";

export class ArcherPreemptiveStrikeTrigger implements WarUnitTrigger {
  readonly name = "궁병선제사격";
  readonly priority: number;
  readonly raiseType: RaiseTypeValue = RaiseType.NONE;
  private static readonly ARCHER_CREW_TYPE = 1;

  constructor(
    public readonly unit: WarUnit,
    priority: number = 50
  ) {
    this.priority = priority;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    if (ctx.phase !== 0) return false;
    if (ctx.self.hasActivatedSkill("선제")) return false;
    if (!isWarUnit(ctx.oppose)) return false;
    if (ctx.oppose.hasActivatedSkill("선제")) return false;
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const oppose = ctx.oppose;
    if (!isWarUnit(oppose)) {
      return { delta: {}, continueExecution: true };
    }

    const logs: string[] = [];
    ctx.self.activateSkill("특수");
    ctx.self.activateSkill("선제");

    const opposeCrewType = oppose.crewType;
    const isOpposeArcher = opposeCrewType === ArcherPreemptiveStrikeTrigger.ARCHER_CREW_TYPE;

    if (isOpposeArcher) {
      oppose.activateSkill("특수");
      oppose.activateSkill("선제");
      ctx.self.multiplyWarPower(2 / 3);
      oppose.multiplyWarPower(2 / 3);
      logs.push("서로 선제 사격을 주고 받았다!");
    } else {
      oppose.multiplyWarPower(0);
      ctx.self.multiplyWarPower(2 / 3);
      ctx.self.activateSkill("회피불가");
      ctx.self.activateSkill("필살불가");
      ctx.self.activateSkill("계략불가");
      oppose.activateSkill("회피불가");
      oppose.activateSkill("필살불가");
      oppose.activateSkill("격노불가");
      oppose.activateSkill("계략불가");

      const selfName = ctx.self.general.name;
      const opposeName = oppose.general.name;
      logs.push(`${selfName}이(가) 상대에게 선제 사격을 했다!`);
      logs.push(`${opposeName}이(가) 상대에게 선제 사격을 받았다!`);
    }

    return {
      delta: { logs: { global: logs } },
      continueExecution: true,
    };
  }
}
