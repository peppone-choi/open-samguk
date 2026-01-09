/**
 * 유니크 아이템 모음
 * 모든 특수 능력을 가진 아이템 클래스들을 내보냅니다.
 */

import { CounterFanItem } from "./CounterFanItem.js";
import { CounterWhiteFanItem } from "./CounterWhiteFanItem.js";
import { HealingBookTaepyeongItem } from "./HealingBookTaepyeongItem.js";
import { HealingBookCheongnangItem } from "./HealingBookCheongnangItem.js";
import { HealingBookSanghanItem } from "./HealingBookSanghanItem.js";
import { HealingPowderItem } from "./HealingPowderItem.js";
import { HealingPillItem } from "./HealingPillItem.js";
import { HealingOintmentItem } from "./HealingOintmentItem.js";
import { SniperWeaponItem } from "./SniperWeaponItem.js";
import { ThrowingKnifeItem } from "./ThrowingKnifeItem.js";
import { PlumBlossomDartItem } from "./PlumBlossomDartItem.js";
import { KillingBlowBookItem } from "./KillingBlowBookItem.js";
import { EvasionBookItem } from "./EvasionBookItem.js";
import { EvasionMagicBookItem } from "./EvasionMagicBookItem.js";
import { AbacusItem } from "./AbacusItem.js";
import { PotteryItem } from "./PotteryItem.js";
import { MoraleLiquorItem } from "./MoraleLiquorItem.js";
import { TrainingLiquorItem } from "./TrainingLiquorItem.js";
import { RecruitmentItem } from "./RecruitmentItem.js";
import { SuppressionBookItem } from "./SuppressionBookItem.js";
import { ExorcismMapItem } from "./ExorcismMapItem.js";
import { IntimidationRopeItem } from "./IntimidationRopeItem.js";
import { LootJadeItem } from "./LootJadeItem.js";
import { BlockBookItem } from "./BlockBookItem.js";
import { FortitudeBookItem } from "./FortitudeBookItem.js";
import { IllusionBookItem } from "./IllusionBookItem.js";
import { ConcentrationBookItem } from "./ConcentrationBookItem.js";
import { SeoChokMapItem } from "./SeoChokMapItem.js";
import { StrategyMapItem } from "./StrategyMapItem.js";
import { FameJewelItem } from "./FameJewelItem.js";
import { TalismanItem } from "./TalismanItem.js";
import { BronzeSparrowItem } from "./BronzeSparrowItem.js";
import { TypeCorrectionLiquorItem } from "./TypeCorrectionLiquorItem.js";
import { RageBookItem } from "./RageBookItem.js";
import { InsightBookItem } from "./InsightBookItem.js";
import { StrategyPouchItem, StrategyBagItem } from "./StrategyConsumables.js";
import { DomesticBoostItem } from "./DomesticBoostItem.js";
// SiegeDefenseBookItem removed - duplicate of DefenseBook2Item (both have code "che_농성_주서음부")
import {
  StrengthBoostLiquorItem,
  IntelBoostLiquorItem,
  LeadershipBoostLiquorItem,
} from "./StatBoostLiquorItems.js";

import {
  MoraleLiquor2Item,
  MoraleLiquor3Item,
  MoraleLiquor4Item,
  MoralePicture1Item,
  MoralePicture2Item,
} from "./MoraleLiquorVariants.js";

import {
  TrainingLiquor2Item,
  TrainingLiquor3Item,
  TrainingBookItem,
  TrainingBook2Item,
} from "./TrainingVariants.js";

import {
  HealingPill2Item,
  HealingPill3Item,
  HealingPill4Item,
  HealingHerb1Item,
} from "./HealingVariants.js";

import { StrategyBookSamryakItem, StrategyBookYukdoItem } from "./StrategyBooks.js";
import { SiegeBookItem, DefenseBookItem, DefenseBook2Item } from "./SiegeDefenseBooks.js";
import { SainswordItem, NoneItem } from "./CheatItems.js";

export {
  CounterFanItem,
  CounterWhiteFanItem,
  HealingBookTaepyeongItem,
  HealingBookCheongnangItem,
  HealingBookSanghanItem,
  HealingPowderItem,
  HealingPillItem,
  HealingOintmentItem,
  SniperWeaponItem,
  ThrowingKnifeItem,
  PlumBlossomDartItem,
  KillingBlowBookItem,
  EvasionBookItem,
  EvasionMagicBookItem,
  AbacusItem,
  PotteryItem,
  MoraleLiquorItem,
  TrainingLiquorItem,
  RecruitmentItem,
  SuppressionBookItem,
  ExorcismMapItem,
  IntimidationRopeItem,
  LootJadeItem,
  BlockBookItem,
  FortitudeBookItem,
  IllusionBookItem,
  ConcentrationBookItem,
  SeoChokMapItem,
  StrategyMapItem,
  FameJewelItem,
  TalismanItem,
  BronzeSparrowItem,
  TypeCorrectionLiquorItem,
  RageBookItem,
  MoraleLiquor2Item,
  MoraleLiquor3Item,
  MoraleLiquor4Item,
  MoralePicture1Item,
  MoralePicture2Item,
  TrainingLiquor2Item,
  TrainingLiquor3Item,
  TrainingBookItem,
  TrainingBook2Item,
  HealingPill2Item,
  HealingPill3Item,
  HealingPill4Item,
  HealingHerb1Item,
  StrategyBookSamryakItem,
  StrategyBookYukdoItem,
  SiegeBookItem,
  DefenseBookItem,
  DefenseBook2Item,
  InsightBookItem,
  StrategyPouchItem,
  StrategyBagItem,
  DomesticBoostItem,
  StrengthBoostLiquorItem,
  IntelBoostLiquorItem,
  LeadershipBoostLiquorItem,
  SainswordItem,
  NoneItem,
};

export const ALL_UNIQUE_ITEMS = [
  CounterFanItem,
  CounterWhiteFanItem,
  HealingBookTaepyeongItem,
  HealingBookCheongnangItem,
  HealingBookSanghanItem,
  HealingPowderItem,
  HealingPillItem,
  HealingOintmentItem,
  SniperWeaponItem,
  ThrowingKnifeItem,
  PlumBlossomDartItem,
  KillingBlowBookItem,
  EvasionBookItem,
  EvasionMagicBookItem,
  AbacusItem,
  PotteryItem,
  MoraleLiquorItem,
  TrainingLiquorItem,
  RecruitmentItem,
  SuppressionBookItem,
  ExorcismMapItem,
  IntimidationRopeItem,
  LootJadeItem,
  BlockBookItem,
  FortitudeBookItem,
  IllusionBookItem,
  ConcentrationBookItem,
  SeoChokMapItem,
  StrategyMapItem,
  FameJewelItem,
  TalismanItem,
  BronzeSparrowItem,
  TypeCorrectionLiquorItem,
  RageBookItem,
  MoraleLiquor2Item,
  MoraleLiquor3Item,
  MoraleLiquor4Item,
  MoralePicture1Item,
  MoralePicture2Item,
  TrainingLiquor2Item,
  TrainingLiquor3Item,
  TrainingBookItem,
  TrainingBook2Item,
  HealingPill2Item,
  HealingPill3Item,
  HealingPill4Item,
  HealingHerb1Item,
  StrategyBookSamryakItem,
  StrategyBookYukdoItem,
  SiegeBookItem,
  DefenseBookItem,
  DefenseBook2Item,
  InsightBookItem,
  StrategyPouchItem,
  StrategyBagItem,
  DomesticBoostItem,
  StrengthBoostLiquorItem,
  IntelBoostLiquorItem,
  LeadershipBoostLiquorItem,
  SainswordItem,
  NoneItem,
];
