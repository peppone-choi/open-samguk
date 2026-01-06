# 장수 트리거 구현 프롬프트

## 목표
미구현된 장수 트리거를 TypeScript로 포팅

## 현재 구현 상태
- [x] `che_병력군량소모.php` → `SoldierMaintenanceTrigger.ts`
- [x] `che_부상경감.php` → `InjuryReductionTrigger.ts`

## 체크리스트

### 미구현 트리거 (2개)
- [ ] `che_도시치료.php` → `CityHealTrigger.ts`
  - 도시에서 자동 치료
  - 조건: 장수가 도시에 있고, 부상 상태
  - 효과: 매 턴 부상 회복
- [ ] `che_아이템치료.php` → `ItemHealTrigger.ts`
  - 아이템으로 치료
  - 조건: 치료 아이템 보유
  - 효과: 아이템 사용 시 부상 회복

## 구현 패턴

```typescript
// packages/logic/src/domain/triggers/CityHealTrigger.ts
import { GeneralTrigger, TriggerContext, TriggerDelta } from './types.js';

export class CityHealTrigger implements GeneralTrigger {
  readonly id = 'city_heal';
  readonly phase = 'turn_end';
  readonly priority = 50;

  canTrigger(ctx: TriggerContext): boolean {
    const { general, city } = ctx;
    // 장수가 도시에 있고 부상이 있을 때
    return general.injury > 0 && general.cityId === city.id;
  }

  execute(ctx: TriggerContext): TriggerDelta {
    const { general, city, rand } = ctx;

    // 도시 레벨에 따른 치료량
    const baseHeal = city.level * 2;
    const healAmount = Math.min(general.injury, baseHeal);

    return {
      generals: {
        [general.id]: {
          injury: general.injury - healAmount,
        },
      },
      logs: {
        general: {
          [general.id]: [`${city.name}에서 부상 ${healAmount}% 회복`],
        },
      },
    };
  }
}
```

```typescript
// packages/logic/src/domain/triggers/ItemHealTrigger.ts
import { GeneralTrigger, TriggerContext, TriggerDelta } from './types.js';

export class ItemHealTrigger implements GeneralTrigger {
  readonly id = 'item_heal';
  readonly phase = 'turn_end';
  readonly priority = 40;

  canTrigger(ctx: TriggerContext): boolean {
    const { general } = ctx;
    // 치료 아이템이 있고 부상이 있을 때
    return general.injury > 0 && this.hasHealItem(general);
  }

  private hasHealItem(general: General): boolean {
    // 치료 아이템 확인
    return general.item === '금창약' || general.item === '화타의술';
  }

  execute(ctx: TriggerContext): TriggerDelta {
    const { general } = ctx;

    const healAmount = this.getHealAmount(general.item);
    const actualHeal = Math.min(general.injury, healAmount);

    return {
      generals: {
        [general.id]: {
          injury: general.injury - actualHeal,
        },
      },
      logs: {
        general: {
          [general.id]: [`${general.item}으로 부상 ${actualHeal}% 회복`],
        },
      },
    };
  }

  private getHealAmount(item: string): number {
    switch (item) {
      case '금창약': return 10;
      case '화타의술': return 20;
      default: return 0;
    }
  }
}
```

## 테스트 작성

```typescript
describe('CityHealTrigger', () => {
  it('should heal general in city', () => {
    const trigger = new CityHealTrigger();
    const ctx = createContext({
      general: createGeneral({ injury: 50, cityId: 1 }),
      city: createCity({ id: 1, level: 8 }),
    });

    expect(trigger.canTrigger(ctx)).toBe(true);
    const delta = trigger.execute(ctx);
    expect(delta.generals?.[1]?.injury).toBeLessThan(50);
  });

  it('should not trigger when general not in city', () => {
    const trigger = new CityHealTrigger();
    const ctx = createContext({
      general: createGeneral({ injury: 50, cityId: 0 }), // 야전
      city: createCity({ id: 1 }),
    });

    expect(trigger.canTrigger(ctx)).toBe(false);
  });
});
```

## 레거시 참조 파일
- `legacy/hwe/sammo/GeneralTrigger/che_도시치료.php`
- `legacy/hwe/sammo/GeneralTrigger/che_아이템치료.php`
