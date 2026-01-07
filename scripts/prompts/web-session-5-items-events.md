# 웹 세션 5: 아이템 + 이벤트 시스템 구현

## 프로젝트 개요

삼국지 모의전투 게임의 레거시 PHP 코드를 TypeScript로 포팅하는 프로젝트입니다.

## 이 세션의 목표

1. 핵심 아이템 50개 구현 (161개 중)
2. 이벤트 시스템 15개 구현 (37개 중)

## 작업 환경

- 레거시 아이템: `legacy/hwe/sammo/ActionItem/` (PHP)
- 레거시 이벤트: `legacy/hwe/sammo/Event/` (PHP)
- 구현 위치: `packages/logic/src/domain/items/` (새로 생성)
- 구현 위치: `packages/logic/src/domain/events/` (새로 생성)

---

# Part A: 아이템 시스템 (50개)

## 구현할 아이템

### 무기 - 고급 (10개)

```
1. che_무기_11_고정도.php → GojungdoWeapon.ts (공격력 +12)
2. che_무기_11_이광궁.php → LeegwangBow.ts (공격력 +12, 궁병 보너스)
3. che_무기_12_철척사모.php → IronSpear.ts (공격력 +14)
4. che_무기_12_칠성검.php → SevenStarSword.ts (공격력 +14)
5. che_무기_13_사모.php → Spear.ts (공격력 +16)
6. che_무기_13_양유기궁.php → YanguigiBow.ts (공격력 +16)
7. che_무기_14_방천화극.php → SkyPiercingHalberd.ts (공격력 +20)
8. che_무기_14_언월도.php → CrescentBlade.ts (공격력 +20)
9. che_무기_15_의천검.php → HeavenSword.ts (공격력 +25)
10. che_무기_15_청홍검.php → BlueRedSword.ts (공격력 +25)
```

### 명마 - 고급 (10개)

```
11. che_명마_11_서량마.php → SeoryangHorse.ts (속도 +12)
12. che_명마_11_화종마.php → HwajongHorse.ts (속도 +12)
13. che_명마_12_사륜거.php → FourWheelCart.ts (속도 +14)
14. che_명마_12_옥란백용구.php → JadeWhiteDragon.ts (속도 +14)
15. che_명마_13_적로.php → RedPath.ts (속도 +16)
16. che_명마_13_절영.php → ShadowStepper.ts (속도 +16)
17. che_명마_14_적란마.php → RedMistHorse.ts (속도 +20)
18. che_명마_14_조황비전.php → ImperialLightning.ts (속도 +20)
19. che_명마_15_적토마.php → RedHare.ts (속도 +25)
20. che_명마_15_한혈마.php → SweatBlood.ts (속도 +25)
```

### 서적 - 고급 (10개)

```
21. che_서적_11_상군서.php → LegalistBook.ts (지력 +12)
22. che_서적_11_춘추전.php → SpringAutumnBook.ts (지력 +12)
23. che_서적_12_맹덕신서.php → MengdeBook.ts (지력 +14)
24. che_서적_12_산해경.php → MountainSeaBook.ts (지력 +14)
25. che_서적_13_관자.php → GuanziBook.ts (지력 +16)
26. che_서적_13_병법24편.php → TwentyFourStrategy.ts (지력 +16)
27. che_서적_14_오자병법.php → WuziArtOfWar.ts (지력 +20)
28. che_서적_14_한비자.php → HanfeiziBook.ts (지력 +20)
29. che_서적_15_노자.php → TaoTeChingBook.ts (지력 +25)
30. che_서적_15_손자병법.php → SunTzuArtOfWar.ts (지력 +25)
```

### 특수 효과 아이템 (20개)

```
31. che_계략_삼략.php → SanryakItem.ts (계략 +20%)
32. che_계략_육도.php → YukdoItem.ts (계략 +15%)
33. che_반계_백우선.php → WhiteFanItem.ts (반계 +25%)
34. che_반계_파초선.php → BananaFanItem.ts (반계 +20%)
35. che_필살_둔갑천서.php → DungapCriticalItem.ts (필살 +20%)
36. che_회피_둔갑천서.php → DungapEvasionItem.ts (회피 +20%)
37. che_회피_태평요술.php → TaepyungEvasionItem.ts (회피 +15%)
38. che_저격_매화수전.php → PlumBlossomItem.ts (저격 +25%)
39. che_저격_비도.php → FlyingKnifeItem.ts (저격 +20%)
40. che_위압_조목삭.php → IntimidationItem.ts (위압 +20%)
41. che_의술_청낭서.php → BlueBagMedicalItem.ts (치료 +30%)
42. che_치료_환약.php → HealingPillItem.ts (부상 -10)
43. che_치료_정력견혈.php → HealingPowderItem.ts (부상 -15)
44. che_훈련_철벽서.php → IronWallTrainingItem.ts (훈련 +20%)
45. che_훈련_단결도.php → UnityTrainingItem.ts (훈련 +15%)
46. che_약탈_옥벽.php → JadeLootItem.ts (약탈 +30%)
47. che_공성_묵자.php → MuziSiegeItem.ts (공성 +25%)
48. che_집중_전국책.php → ConcentrationItem.ts (집중 +20%)
49. che_불굴_상편.php → UnyieldingItem.ts (사기 유지)
50. event_충차.php → RammingCarItem.ts (공성 장비)
```

## 아이템 구현 템플릿

```typescript
// packages/logic/src/domain/items/BaseItem.ts
export type ItemCategory = "weapon" | "horse" | "book" | "special";
export type ItemSlot = "weapon" | "book" | "horse" | "item";

export interface ItemEffect {
  // 스탯 보너스
  strength?: number;
  intel?: number;
  leadership?: number;
  speed?: number;

  // 전투 보너스
  attackBonus?: number;
  defenseBonus?: number;
  criticalBonus?: number;
  evasionBonus?: number;

  // 특수 효과
  strategyBonus?: number;
  counterBonus?: number;
  sniperBonus?: number;
  healingBonus?: number;
  trainingBonus?: number;
  siegeBonus?: number;
}

export abstract class BaseItem {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly grade: number; // 1-15
  abstract readonly category: ItemCategory;
  abstract readonly slot: ItemSlot;
  abstract readonly description: string;

  abstract getEffect(): ItemEffect;
}
```

```typescript
// packages/logic/src/domain/items/weapons/RedHare.ts
import { BaseItem, ItemEffect } from "../BaseItem.js";

export class RedHare extends BaseItem {
  readonly id = "horse_15_redhare";
  readonly name = "적토마";
  readonly grade = 15;
  readonly category = "horse" as const;
  readonly slot = "horse" as const;
  readonly description = "천하제일의 명마. 하루에 천리를 달린다.";

  getEffect(): ItemEffect {
    return {
      speed: 25,
      evasionBonus: 0.1,
    };
  }
}
```

```typescript
// packages/logic/src/domain/items/special/SanryakItem.ts
import { BaseItem, ItemEffect } from "../BaseItem.js";

export class SanryakItem extends BaseItem {
  readonly id = "special_sanryak";
  readonly name = "삼략";
  readonly grade = 14;
  readonly category = "special" as const;
  readonly slot = "item" as const;
  readonly description = "태공망의 병법서. 계략 성공률이 크게 증가한다.";

  getEffect(): ItemEffect {
    return {
      strategyBonus: 0.2,
      intel: 5,
    };
  }
}
```

---

# Part B: 이벤트 시스템 (15개)

## 구현할 이벤트

### 주기적 이벤트 (6개)

```
1. ProcessIncome.php → ProcessIncomeEvent.ts
   - 매월 세금/수입 처리

2. ProcessSemiAnnual.php → ProcessSemiAnnualEvent.ts
   - 반기별 처리 (1월, 7월)

3. NewYear.php → NewYearEvent.ts
   - 새해 이벤트 (장수 나이 증가, 사망 체크)

4. UpdateCitySupply.php → UpdateCitySupplyEvent.ts
   - 도시 보급 상태 갱신

5. UpdateNationLevel.php → UpdateNationLevelEvent.ts
   - 국가 레벨 갱신

6. RandomizeCityTradeRate.php → RandomizeCityTradeEvent.ts
   - 도시 교역률 랜덤 변경
```

### NPC 이벤트 (4개)

```
7. CreateManyNPC.php → CreateManyNPCEvent.ts
   - 다수 NPC 생성

8. RegNPC.php → RegNPCEvent.ts
   - NPC 등록

9. RegNeutralNPC.php → RegNeutralNPCEvent.ts
   - 재야 NPC 등록

10. AutoDeleteInvader.php → AutoDeleteInvaderEvent.ts
    - 이민족 자동 삭제
```

### 특수 이벤트 (5개)

```
11. RaiseDisaster.php → RaiseDisasterEvent.ts
    - 재해 발생 (가뭄, 홍수, 메뚜기)

12. RaiseInvader.php → RaiseInvaderEvent.ts
    - 이민족 발생

13. OpenNationBetting.php → OpenNationBettingEvent.ts
    - 국가 배팅 시작

14. FinishNationBetting.php → FinishNationBettingEvent.ts
    - 국가 배팅 종료

15. AssignGeneralSpeciality.php → AssignSpecialityEvent.ts
    - 장수 특기 부여
```

## 이벤트 구현 템플릿

```typescript
// packages/logic/src/domain/events/BaseEvent.ts
import { RandUtil } from "@sammo-ts/common";
import { WorldSnapshot } from "../entities.js";

export interface EventCondition {
  check(snapshot: WorldSnapshot): boolean;
}

export interface EventDelta {
  generals?: Record<number, Partial<General>>;
  nations?: Record<number, Partial<Nation>>;
  cities?: Record<number, Partial<City>>;
  logs?: {
    system?: string[];
    nation?: Record<number, string[]>;
  };
}

export abstract class BaseEvent {
  abstract readonly id: string;
  abstract readonly name: string;

  abstract getCondition(): EventCondition;
  abstract execute(rand: RandUtil, snapshot: WorldSnapshot): EventDelta;
}
```

```typescript
// packages/logic/src/domain/events/ProcessIncomeEvent.ts
import { BaseEvent, EventCondition, EventDelta } from "./BaseEvent.js";
import { RandUtil } from "@sammo-ts/common";
import { WorldSnapshot, Nation, City } from "../entities.js";

export class ProcessIncomeEvent extends BaseEvent {
  readonly id = "process_income";
  readonly name = "세금 징수";

  getCondition(): EventCondition {
    return {
      check: (snapshot) => {
        // 매월 1일에 실행
        return snapshot.gameTime.day === 1;
      },
    };
  }

  execute(rand: RandUtil, snapshot: WorldSnapshot): EventDelta {
    const delta: EventDelta = {
      nations: {},
      logs: { nation: {} },
    };

    for (const nation of Object.values(snapshot.nations)) {
      const income = this.calculateIncome(nation, snapshot);

      delta.nations![nation.id] = {
        gold: nation.gold + income.gold,
        rice: nation.rice + income.rice,
      };

      delta.logs!.nation![nation.id] = [`세금 징수: 금 ${income.gold}, 쌀 ${income.rice}`];
    }

    return delta;
  }

  private calculateIncome(nation: Nation, snapshot: WorldSnapshot) {
    const cities = Object.values(snapshot.cities).filter((c) => c.nationId === nation.id);

    let gold = 0;
    let rice = 0;

    for (const city of cities) {
      // 상업 → 금, 농업 → 쌀
      gold += Math.floor((city.comm * nation.rate) / 100);
      rice += Math.floor((city.agri * nation.rate) / 100);
    }

    return { gold, rice };
  }
}
```

```typescript
// packages/logic/src/domain/events/RaiseDisasterEvent.ts
import { BaseEvent, EventCondition, EventDelta } from "./BaseEvent.js";
import { RandUtil } from "@sammo-ts/common";
import { WorldSnapshot, City } from "../entities.js";

type DisasterType = "drought" | "flood" | "locust";

export class RaiseDisasterEvent extends BaseEvent {
  readonly id = "raise_disaster";
  readonly name = "재해 발생";

  getCondition(): EventCondition {
    return {
      check: (snapshot) => {
        // 3개월마다 재해 체크
        return snapshot.gameTime.month % 3 === 0;
      },
    };
  }

  execute(rand: RandUtil, snapshot: WorldSnapshot): EventDelta {
    const delta: EventDelta = {
      cities: {},
      logs: { system: [], nation: {} },
    };

    // 10% 확률로 재해 발생
    if (rand.nextFloat() > 0.1) {
      return delta;
    }

    // 랜덤 도시 선택
    const cities = Object.values(snapshot.cities);
    const targetCity = rand.choice(cities);

    if (!targetCity) return delta;

    // 재해 유형 선택
    const disasterType = rand.choice(["drought", "flood", "locust"] as DisasterType[]);
    const damage = this.calculateDamage(disasterType, targetCity, rand);

    delta.cities![targetCity.id] = damage;
    delta.logs!.system!.push(
      `${targetCity.name}에 ${this.getDisasterName(disasterType)}이(가) 발생했습니다!`
    );

    if (targetCity.nationId) {
      delta.logs!.nation![targetCity.nationId] = [
        `${targetCity.name}에 재해가 발생했습니다. 피해 복구가 필요합니다.`,
      ];
    }

    return delta;
  }

  private calculateDamage(type: DisasterType, city: City, rand: RandUtil) {
    const baseDamage = 0.1 + rand.nextFloat() * 0.2; // 10-30%

    switch (type) {
      case "drought":
        return {
          agri: Math.floor(city.agri * (1 - baseDamage)),
          pop: Math.floor(city.pop * (1 - baseDamage * 0.5)),
        };
      case "flood":
        return {
          agri: Math.floor(city.agri * (1 - baseDamage)),
          comm: Math.floor(city.comm * (1 - baseDamage * 0.5)),
        };
      case "locust":
        return {
          agri: Math.floor(city.agri * (1 - baseDamage * 1.5)),
        };
    }
  }

  private getDisasterName(type: DisasterType): string {
    switch (type) {
      case "drought":
        return "가뭄";
      case "flood":
        return "홍수";
      case "locust":
        return "메뚜기떼";
    }
  }
}
```

## 테스트 템플릿

```typescript
// packages/logic/src/domain/items/weapons/RedHare.test.ts
import { describe, it, expect } from "vitest";
import { RedHare } from "./RedHare.js";

describe("RedHare", () => {
  it("should have speed bonus", () => {
    const item = new RedHare();
    const effect = item.getEffect();

    expect(effect.speed).toBe(25);
  });

  it("should have grade 15", () => {
    const item = new RedHare();
    expect(item.grade).toBe(15);
  });
});
```

```typescript
// packages/logic/src/domain/events/ProcessIncomeEvent.test.ts
import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { ProcessIncomeEvent } from "./ProcessIncomeEvent.js";

describe("ProcessIncomeEvent", () => {
  it("should calculate income based on tax rate", () => {
    const event = new ProcessIncomeEvent();
    const rng = new LiteHashDRBG("test");
    const rand = new RandUtil(rng);

    const snapshot = {
      nations: {
        1: { id: 1, gold: 1000, rice: 1000, rate: 10 },
      },
      cities: {
        1: { id: 1, nationId: 1, agri: 5000, comm: 3000 },
      },
      gameTime: { year: 200, month: 1, day: 1 },
    };

    const delta = event.execute(rand, snapshot);

    expect(delta.nations?.[1]?.gold).toBeGreaterThan(1000);
    expect(delta.nations?.[1]?.rice).toBeGreaterThan(1000);
  });
});
```

## 진행 체크리스트

아이템:

- [ ] BaseItem.ts
- [ ] 무기 10개 + tests
- [ ] 명마 10개 + tests
- [ ] 서적 10개 + tests
- [ ] 특수 20개 + tests

이벤트:

- [ ] BaseEvent.ts
- [ ] ProcessIncomeEvent + test
- [ ] ProcessSemiAnnualEvent + test
- [ ] NewYearEvent + test
- [ ] RaiseDisasterEvent + test
- [ ] ... (나머지 11개)

## 완료 기준

- 아이템 50개 구현
- 이벤트 15개 구현
- 각 항목에 최소 2개 테스트
- `pnpm --filter @sammo-ts/logic test` 통과
