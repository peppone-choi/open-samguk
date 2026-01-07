# 아이템 시스템 구현 프롬프트

## 목표

레거시 PHP 아이템 시스템(161개)을 TypeScript로 포팅

## 레거시 파일 위치

`legacy/hwe/sammo/ActionItem/`

## 체크리스트

### Phase 1: 기본 구조 (1개)

- [ ] `None.php` → `NoneItem.ts` (기본 아이템)

### Phase 2: 무기 (30개)

#### 1~6등급 (기본)

- [ ] che*무기\_01*단도.php → ShortSwordItem.ts
- [ ] che*무기\_02*단궁.php → ShortBowItem.ts
- [ ] che*무기\_03*단극.php → ShortHalberdItem.ts
- [ ] che*무기\_04*목검.php → WoodSwordItem.ts
- [ ] che*무기\_05*죽창.php → BambooSpearItem.ts
- [ ] che*무기\_06*소부.php → SmallAxeItem.ts

#### 7~10등급 (중급)

- [ ] che*무기\_07*동추.php ~ che*무기\_10*삼첨도.php (8개)

#### 11~15등급 (고급)

- [ ] che*무기\_11*고정도.php ~ che*무기\_15*청홍검.php (10개)

### Phase 3: 명마 (30개)

#### 1~6등급 (기본)

- [ ] che*명마\_01*노기.php → OldHorseItem.ts
- [ ] che*명마\_02*조랑.php → PonyItem.ts
- [ ] ... (30개)

#### 15등급 (최고급)

- [ ] che*명마\_15*적토마.php → RedHareItem.ts
- [ ] che*명마\_15*한혈마.php → SweatBloodItem.ts

### Phase 4: 서적 (30개)

- [ ] che*서적\_01*효경전.php ~ che*서적\_15*손자병법.php

### Phase 5: 특수 효과 아이템 (70+개)

#### 계략 강화

- [ ] che*계략*삼략.php → SanryakItem.ts
- [ ] che*계략*육도.php → YukdoItem.ts
- [ ] che*계략*이추.php → LeechuItem.ts
- [ ] che*계략*향낭.php → SachhetItem.ts

#### 반계/회피/필살

- [ ] che*반계*백우선.php → WhiteFanItem.ts
- [ ] che*반계*파초선.php → BananaFanItem.ts
- [ ] che*회피*둔갑천서.php → DungapEvasionItem.ts
- [ ] che*회피*태평요술.php → TaepyungEvasionItem.ts
- [ ] che*필살*둔갑천서.php → DungapCriticalItem.ts

#### 치료/의술

- [ ] che*치료*환약.php → PillItem.ts
- [ ] che*치료*정력견혈.php → HealingPowderItem.ts
- [ ] che*치료*칠엽청점.php → SevenLeafItem.ts
- [ ] che*치료*오석산.php → FiveStoneItem.ts
- [ ] che*치료*무후행군.php → MuhuMarchItem.ts
- [ ] che*치료*도소연명.php → LifeExtendItem.ts
- [ ] che*의술*상한잡병론.php → MedicalTreatiseItem.ts
- [ ] che*의술*정력견혈산.php → HealingPowderAdvItem.ts
- [ ] che*의술*청낭서.php → BlueBagItem.ts
- [ ] che*의술*태평청령.php → TaepyungMedItem.ts

#### 능력치 증가

- [ ] che*능력치*무력\_두강주.php → StrengthWineItem.ts
- [ ] che*능력치*지력\_이강주.php → IntelWineItem.ts
- [ ] che*능력치*통솔\_보령압주.php → LeadershipWineItem.ts

#### 훈련/사기

- [ ] che*훈련*\*.php (5개)
- [ ] che*사기*\*.php (6개)

#### 전투 특기 아이템 (이벤트)

- [ ] event*전투특기*격노.php ~ event*전투특기*환술.php (21개)

#### 기타

- [ ] che*공성*묵자.php → MuziSiegeItem.ts
- [ ] che*내정*납금박산로.php → GoldRoadItem.ts
- [ ] che*저격*매화수전.php → PlumBlossomItem.ts
- [ ] che*저격*비도.php → FlyingKnifeItem.ts
- [ ] che*약탈*옥벽.php → JadeLootItem.ts
- [ ] che*위압*조목삭.php → IntimidationItem.ts
- [ ] event\_충차.php → RammingCarItem.ts

## 구현 패턴

```typescript
// packages/logic/src/domain/items/BaseItem.ts
export interface ItemEffect {
  statBonus?: Partial<GeneralStats>;
  combatBonus?: CombatBonus;
  specialEffect?: string;
}

export abstract class BaseItem {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly grade: number; // 1-15
  abstract readonly category: "weapon" | "horse" | "book" | "special";

  abstract getEffect(ctx: ItemContext): ItemEffect;
}
```

```typescript
// packages/logic/src/domain/items/weapons/RedHareItem.ts
import { BaseItem, ItemEffect } from "../BaseItem.js";

export class RedHareItem extends BaseItem {
  readonly id = "horse_15_redhare";
  readonly name = "적토마";
  readonly grade = 15;
  readonly category = "horse";

  getEffect(ctx: ItemContext): ItemEffect {
    return {
      statBonus: { speed: 30 },
      combatBonus: { evasion: 0.1 },
    };
  }
}
```

## 아이템 등급별 효과 기준

| 등급  | 무기 공격력 | 명마 속도 | 서적 지력 |
| ----- | ----------- | --------- | --------- |
| 1-3   | +1~3        | +1~3      | +1~3      |
| 4-6   | +4~6        | +4~6      | +4~6      |
| 7-9   | +7~10       | +7~10     | +7~10     |
| 10-12 | +11~15      | +11~15    | +11~15    |
| 13-15 | +16~25      | +16~25    | +16~25    |

## 레거시 참조

- `legacy/hwe/sammo/ActionItem/`
- `legacy/hwe/sammo/BaseItem.php`
- `legacy/hwe/sammo/BaseStatItem.php`
