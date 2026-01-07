/**
 * 묵자(공성) - che_공성_묵자.php 포팅
 * [전투] 성벽 공격 시 대미지 +50%
 */
import { BaseItem } from "../BaseItem.js";
import type { WarPowerMultiplier, WarUnitReadOnly } from "../types.js";

export class SiegeBookItem extends BaseItem {
  readonly code = "che_공성_묵자";
  readonly rawName = "묵자";
  readonly name = "묵자(공성)";
  readonly info = "[전투] 성벽 공격 시 대미지 +50%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const oppose = unit.getOppose?.();
    // 상대가 도시(성벽)인 경우 공격력 +50%
    if (oppose && "wall" in oppose) {
      return [1.5, 1];
    }
    return [1, 1];
  }
}

/**
 * 위공자병법(농성) - che_농성_위공자병법.php 포팅
 * [계략] 장수 주둔 도시 화계·탈취·파괴·선동 : 성공률 -30%p
 * [전투] 상대 계략 시도 확률 -10%p, 상대 계략 성공 확률 -10%p
 */
import type { GeneralReadOnly, StatName } from "../types.js";

export class DefenseBookItem extends BaseItem {
  readonly code = "che_농성_위공자병법";
  readonly rawName = "위공자병법";
  readonly name = "위공자병법(농성)";
  readonly info =
    "[계략] 장수 주둔 도시 화계·탈취·파괴·선동 : 성공률 -30%p\n[전투] 상대 계략 시도 확률 -10%p, 상대 계략 성공 확률 -10%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "sabotageDefence") {
      return value + 0.3;
    }
    return value;
  }

  onCalcOpposeStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    if (statName === "warMagicTrialProb") {
      return value - 0.1;
    }
    if (statName === "warMagicSuccessProb") {
      return value - 0.1;
    }
    return value;
  }
}
