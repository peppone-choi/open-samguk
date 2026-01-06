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
- [ ] che_무기_01_단도.php → ShortSwordItem.ts
- [ ] che_무기_02_단궁.php → ShortBowItem.ts
- [ ] che_무기_03_단극.php → ShortHalberdItem.ts
- [ ] che_무기_04_목검.php → WoodSwordItem.ts
- [ ] che_무기_05_죽창.php → BambooSpearItem.ts
- [ ] che_무기_06_소부.php → SmallAxeItem.ts

#### 7~10등급 (중급)
- [ ] che_무기_07_동추.php ~ che_무기_10_삼첨도.php (8개)

#### 11~15등급 (고급)
- [ ] che_무기_11_고정도.php ~ che_무기_15_청홍검.php (10개)

### Phase 3: 명마 (30개)
#### 1~6등급 (기본)
- [ ] che_명마_01_노기.php → OldHorseItem.ts
- [ ] che_명마_02_조랑.php → PonyItem.ts
- [ ] ... (30개)

#### 15등급 (최고급)
- [ ] che_명마_15_적토마.php → RedHareItem.ts
- [ ] che_명마_15_한혈마.php → SweatBloodItem.ts

### Phase 4: 서적 (30개)
- [ ] che_서적_01_효경전.php ~ che_서적_15_손자병법.php

### Phase 5: 특수 효과 아이템 (70+개)

#### 계략 강화
- [ ] che_계략_삼략.php → SanryakItem.ts
- [ ] che_계략_육도.php → YukdoItem.ts
- [ ] che_계략_이추.php → LeechuItem.ts
- [ ] che_계략_향낭.php → SachhetItem.ts

#### 반계/회피/필살
- [ ] che_반계_백우선.php → WhiteFanItem.ts
- [ ] che_반계_파초선.php → BananaFanItem.ts
- [ ] che_회피_둔갑천서.php → DungapEvasionItem.ts
- [ ] che_회피_태평요술.php → TaepyungEvasionItem.ts
- [ ] che_필살_둔갑천서.php → DungapCriticalItem.ts

#### 치료/의술
- [ ] che_치료_환약.php → PillItem.ts
- [ ] che_치료_정력견혈.php → HealingPowderItem.ts
- [ ] che_치료_칠엽청점.php → SevenLeafItem.ts
- [ ] che_치료_오석산.php → FiveStoneItem.ts
- [ ] che_치료_무후행군.php → MuhuMarchItem.ts
- [ ] che_치료_도소연명.php → LifeExtendItem.ts
- [ ] che_의술_상한잡병론.php → MedicalTreatiseItem.ts
- [ ] che_의술_정력견혈산.php → HealingPowderAdvItem.ts
- [ ] che_의술_청낭서.php → BlueBagItem.ts
- [ ] che_의술_태평청령.php → TaepyungMedItem.ts

#### 능력치 증가
- [ ] che_능력치_무력_두강주.php → StrengthWineItem.ts
- [ ] che_능력치_지력_이강주.php → IntelWineItem.ts
- [ ] che_능력치_통솔_보령압주.php → LeadershipWineItem.ts

#### 훈련/사기
- [ ] che_훈련_*.php (5개)
- [ ] che_사기_*.php (6개)

#### 전투 특기 아이템 (이벤트)
- [ ] event_전투특기_격노.php ~ event_전투특기_환술.php (21개)

#### 기타
- [ ] che_공성_묵자.php → MuziSiegeItem.ts
- [ ] che_내정_납금박산로.php → GoldRoadItem.ts
- [ ] che_저격_매화수전.php → PlumBlossomItem.ts
- [ ] che_저격_비도.php → FlyingKnifeItem.ts
- [ ] che_약탈_옥벽.php → JadeLootItem.ts
- [ ] che_위압_조목삭.php → IntimidationItem.ts
- [ ] event_충차.php → RammingCarItem.ts

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
  abstract readonly category: 'weapon' | 'horse' | 'book' | 'special';

  abstract getEffect(ctx: ItemContext): ItemEffect;
}
```

```typescript
// packages/logic/src/domain/items/weapons/RedHareItem.ts
import { BaseItem, ItemEffect } from '../BaseItem.js';

export class RedHareItem extends BaseItem {
  readonly id = 'horse_15_redhare';
  readonly name = '적토마';
  readonly grade = 15;
  readonly category = 'horse';

  getEffect(ctx: ItemContext): ItemEffect {
    return {
      statBonus: { speed: 30 },
      combatBonus: { evasion: 0.1 },
    };
  }
}
```

## 아이템 등급별 효과 기준

| 등급 | 무기 공격력 | 명마 속도 | 서적 지력 |
|------|-------------|-----------|-----------|
| 1-3 | +1~3 | +1~3 | +1~3 |
| 4-6 | +4~6 | +4~6 | +4~6 |
| 7-9 | +7~10 | +7~10 | +7~10 |
| 10-12 | +11~15 | +11~15 | +11~15 |
| 13-15 | +16~25 | +16~25 | +16~25 |

## 레거시 참조
- `legacy/hwe/sammo/ActionItem/`
- `legacy/hwe/sammo/BaseItem.php`
- `legacy/hwe/sammo/BaseStatItem.php`
