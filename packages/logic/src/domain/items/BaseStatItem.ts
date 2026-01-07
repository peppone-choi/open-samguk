import { BaseItem } from "./BaseItem.js";
import type {
  ItemType,
  ItemRarity,
  StatBonus,
  StatName,
  GeneralReadOnly,
  StatItemConfig,
} from "./types.js";

/**
 * 스탯 아이템 기본 클래스
 *
 * 명마(통솔), 무기(무력), 서적(지력)을 증가시키는 장비 아이템
 * 레거시 BaseStatItem.php를 TypeScript로 포팅
 */
export abstract class BaseStatItem extends BaseItem {
  /** 스탯 종류 한글명 (통솔/무력/지력) */
  readonly statNick: string;
  /** 스탯 종류 영문명 */
  readonly statType: "leadership" | "strength" | "intel";
  /** 스탯 증가량 */
  readonly statValue: number;

  readonly rawName: string;
  readonly name: string;
  readonly info: string;
  readonly cost: number;
  readonly buyable: boolean;
  readonly rarity: ItemRarity;

  /**
   * @param config 스탯 아이템 설정
   */
  constructor(config: StatItemConfig) {
    super();
    this.statType = config.statType;
    this.statValue = config.statValue;
    this.rawName = config.rawName;
    this.cost = config.cost;
    this.buyable = config.buyable;

    // 스탯 한글명 설정
    const nickMap: Record<"leadership" | "strength" | "intel", string> = {
      leadership: "통솔",
      strength: "무력",
      intel: "지력",
    };
    this.statNick = nickMap[config.statType];

    // 이름 및 설명 설정
    this.name = `${config.rawName}(+${config.statValue})`;
    this.info = `${this.statNick} +${config.statValue}`;

    // 희귀도 결정: buyable이 false이면 유니크
    this.rarity = config.buyable ? "common" : "unique";
  }

  /**
   * 스탯 보너스 반환
   */
  override getStatBonus(): StatBonus {
    return {
      [this.statType]: this.statValue,
    };
  }

  /**
   * 스탯 계산 훅
   * 해당 스탯에 보너스 적용
   */
  override onCalcStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    if (statName === this.statType) {
      return value + this.statValue;
    }
    return value;
  }
}

/**
 * 무기 아이템 기본 클래스
 */
export abstract class BaseWeaponItem extends BaseStatItem {
  readonly type: ItemType = "weapon";

  constructor(config: Omit<StatItemConfig, "statType">) {
    super({ ...config, statType: "strength" });
  }
}

/**
 * 명마 아이템 기본 클래스
 */
export abstract class BaseHorseItem extends BaseStatItem {
  readonly type: ItemType = "horse";

  constructor(config: Omit<StatItemConfig, "statType">) {
    super({ ...config, statType: "leadership" });
  }
}

/**
 * 서적 아이템 기본 클래스
 */
export abstract class BaseBookItem extends BaseStatItem {
  readonly type: ItemType = "book";

  constructor(config: Omit<StatItemConfig, "statType">) {
    super({ ...config, statType: "intel" });
  }
}
