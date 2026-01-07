import type { WarUnit, WarUnitCity } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 기병 병종 전투 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_기병병종전투.php
 *
 * - Priority: FINAL + 100 (50100)
 * - 기병 특성: 공격 시 유리, 수비 시 불리, 성벽전 불리
 */
export class CavalryBattleTrigger implements PriorityWarUnitTrigger {
  readonly name = "기병병종전투";
  readonly priority = TriggerPriority.FINAL + 100;
  readonly raiseType = RaiseType.NONE;

  constructor(public readonly unit: WarUnit) {}

  private isWarUnitCity(unit: WarUnit | WarUnitCity): unit is WarUnitCity {
    return "wall" in unit && "def" in unit;
  }

  attempt(_ctx: WarUnitTriggerContext): boolean {
    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    if (!ctx.isAttacker) {
      oppose.multiplyWarPower(1.02);
      self.multiplyWarPower(0.97);
    } else if (this.isWarUnitCity(oppose)) {
      self.multiplyWarPower(0.9);
    } else {
      oppose.multiplyWarPower(0.97);
      self.multiplyWarPower(1.02);
    }

    return {
      delta: {},
      continueExecution: true,
    };
  }
}
