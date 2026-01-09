import { General } from "../entities.js";
import { RandUtil } from "@sammo/common";
import {
  GeneralTriggerCaller,
  WarUnitTriggerCaller,
  WarUnit,
  StatAux,
  DomesticAux,
} from "../specials/types.js";
import type { Trigger } from "../Trigger.js";

/**
 * 아이템 타입 (무기, 서적, 명마, 보물 등)
 */
export type ItemType = "weapon" | "book" | "horse" | "item";

/**
 * 아이템 희귀도
 */
export type ItemRarity = "common" | "rare" | "unique";

/**
 * 아이템 스탯 보너스
 */
export type StatBonus = Partial<Record<StatName, number>>;

/**
 * 스탯 명칭
 */
export type StatName = "leadership" | "strength" | "intel" | "charm" | "politics" | string;

/**
 * 내정 턴 타입 (상업투자, 농지개간 등)
 */
export type DomesticTurnType = string;

/**
 * 내정 변수 타입 (효과량, 비용 등)
 */
export type DomesticVarType = "success" | "cost" | "amount" | string;

/**
 * 전투력 배율 [공격, 방어]
 */
export type WarPowerMultiplier = [number, number];

/**
 * 읽기 전용 대상을 위한 타입 알리아스
 */
export type GeneralReadOnly = General;
export type WarUnitReadOnly = WarUnit;

/**
 * 아이템 메타 정보 (레지스트리용)
 */
export interface ItemMeta {
  code: string;
  create: () => IItem;
}

/**
 * 아이템 정보 인터페이스
 */
export interface ItemInfo {
  readonly code: string;
  readonly name: string;
  readonly type: ItemType;
  readonly cost: number;
  readonly reqSecu: number;
  readonly buyable: boolean;
  readonly consumable: boolean;
  readonly info: string;
  readonly statType?: "leadership" | "strength" | "intel" | "charm" | "politics";
  readonly statValue?: number;
  readonly rarity?: ItemRarity;
}

/**
 * 스탯 아이템 설정 정보
 */
export interface StatItemConfig {
  statType: "leadership" | "strength" | "intel";
  statValue: number;
  rawName: string;
  cost: number;
  buyable: boolean;
}

/**
 * 아이템 개체 인터페이스 (레거시 BaseItem 대응)
 */
export interface IItem extends ItemInfo {
  readonly rawName: string;
  readonly rarity: ItemRarity;

  getStatBonus(): StatBonus;
  canEquip(general: GeneralReadOnly): boolean;

  onCalcStat(general: GeneralReadOnly, statName: StatName, value: number, aux?: any): number;
  onCalcOpposeStat(general: GeneralReadOnly, statName: StatName, value: number, aux?: any): number;
  onCalcDomestic(
    turnType: DomesticTurnType,
    varType: DomesticVarType,
    value: number,
    aux?: DomesticAux
  ): number;
  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier;

  getPreTurnExecuteTriggerList?(general: General): Trigger | null;
  getBattleInitSkillTriggerList?(unit: WarUnit): WarUnitTriggerCaller | null;
  getBattlePhaseSkillTriggerList?(unit: WarUnit): WarUnitTriggerCaller | null;
  onArbitraryAction?(
    general: General,
    rng: RandUtil,
    actionType: string,
    phase?: string,
    aux?: any
  ): any;
  tryConsumeNow?(general: General, actionType: string, command: string): boolean;
}
