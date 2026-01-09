import type { WarUnit, WarUnitCity } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 기병 병종 전투 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_기병병종전투.php
 *
 * - Priority: FINAL + 100 (50100)
 * - 기병 특성: 공격 시 유리, 수비 시 불리, 성벽전 불리
 */
export class CavalryBattleTrigger implements WarUnitTrigger {
  readonly name = "기병병종전투";
  readonly priority = TriggerPriority.BEGIN + 150;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE
  ) {
    this.raiseType = raiseType;
  }

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
      if (!this.isWarUnitCity(oppose)) {
        oppose.multiplyWarPower(1.02);
      }
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
