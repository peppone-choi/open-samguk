import type {
  IItem,
  ItemType,
  ItemRarity,
  StatBonus,
  StatName,
  DomesticTurnType,
  DomesticVarType,
  WarPowerMultiplier,
  GeneralReadOnly,
  WarUnitReadOnly,
} from "./types.js";

/**
 * 아이템 기본 추상 클래스
 *
 * 레거시 BaseItem.php를 TypeScript로 포팅
 * iAction 인터페이스의 기본 구현을 제공
 */
export abstract class BaseItem implements IItem {
  abstract readonly code: string;
  abstract readonly rawName: string;
  abstract readonly name: string;
  abstract readonly info: string;
  abstract readonly type: ItemType;

  readonly rarity: ItemRarity = "common";
  readonly cost: number = 0;
  readonly consumable: boolean = false;
  readonly buyable: boolean = false;
  readonly reqSecu: number = 0;

  /**
   * 스탯 보너스 반환 (기본: 보너스 없음)
   */
  getStatBonus(): StatBonus {
    return {};
  }

  /**
   * 장착 가능 여부 확인 (기본: 항상 가능)
   */
  canEquip(_general: GeneralReadOnly): boolean {
    return true;
  }

  /**
   * 스탯 계산 훅 (기본: 값 그대로 반환)
   * 하위 클래스에서 오버라이드하여 스탯 보너스 적용
   */
  onCalcStat(
    _general: GeneralReadOnly,
    _statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    return value;
  }

  /**
   * 상대 스탯 계산 훅 (기본: 값 그대로 반환)
   * 디버프 효과 적용 시 오버라이드
   */
  onCalcOpposeStat(
    _general: GeneralReadOnly,
    _statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    return value;
  }

  /**
   * 내정 효과 계산 훅 (기본: 값 그대로 반환)
   * 내정 성공률/비용/효과량 보정 시 오버라이드
   */
  onCalcDomestic(
    _turnType: DomesticTurnType,
    _varType: DomesticVarType,
    value: number,
    _aux?: unknown
  ): number {
    return value;
  }

  /**
   * 전투력 배율 반환 (기본: [1, 1])
   * [공격배율, 방어배율]
   */
  getWarPowerMultiplier(_unit: WarUnitReadOnly): WarPowerMultiplier {
    return [1, 1];
  }
}
