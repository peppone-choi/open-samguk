# 특기 시스템 구현 프롬프트

## 목표
레거시 PHP 특기 시스템을 TypeScript로 포팅

## 사전 조건
1. `packages/logic/src/domain/specials/BaseSpecial.ts` 분석 완료
2. 레거시 `legacy/hwe/sammo/BaseSpecial.php` 분석 완료

## 체크리스트

### Phase 1: 전투 특기 (ActionSpecialWar) - 21개

#### 필수 특기 (우선순위 높음)
- [ ] `che_필살.php` → `CriticalSpecial.ts` - 필살 확률 증가
- [ ] `che_무쌍.php` → `UnrivaledSpecial.ts` - 공격력/방어력 보너스
- [ ] `che_돌격.php` → `ChargeSpecial.ts` - 돌격 데미지 증가
- [ ] `che_집중.php` → `ConcentrationSpecial.ts` - 명중률 증가
- [ ] `che_견고.php` → `FortitudeSpecial.ts` - 방어력 증가

#### 병종 관련 특기
- [ ] `che_기병.php` → `CavalrySpecial.ts`
- [ ] `che_궁병.php` → `ArcherSpecial.ts`
- [ ] `che_보병.php` → `InfantrySpecial.ts`
- [ ] `che_귀병.php` → `SpiritSoldierSpecial.ts`

#### 전술 특기
- [ ] `che_반계.php` → `CounterStrategySpecial.ts`
- [ ] `che_환술.php` → `IllusionSpecial.ts`
- [ ] `che_신산.php` → `DivineCalculationSpecial.ts`
- [ ] `che_위압.php` → `IntimidationSpecial.ts`
- [ ] `che_저격.php` → `SniperSpecial.ts`
- [ ] `che_격노.php` → `RageSpecial.ts`

#### 보조 특기
- [ ] `che_공성.php` → `SiegeSpecial.ts`
- [ ] `che_의술.php` → `MedicineSpecial.ts`
- [ ] `che_징병.php` → `ConscriptionSpecial.ts`
- [ ] `che_신중.php` → `CautionSpecial.ts`
- [ ] `che_척사.php` → `ExorcismSpecial.ts`

### Phase 2: 내정 특기 (ActionSpecialDomestic) - 9개

- [ ] `che_경작.php` → `CultivationSpecial.ts` - 농업 개발 보너스
- [ ] `che_상재.php` → `CommerceSpecial.ts` - 상업 개발 보너스
- [ ] `che_인덕.php` → `BenevolenceSpecial.ts` - 민심 관련 보너스
- [ ] `che_축성.php` → `ConstructionSpecial.ts` - 성벽/수비 보너스
- [ ] `che_수비.php` → `DefenseSpecial.ts` - 수비 강화 보너스
- [ ] `che_발명.php` → `InventionSpecial.ts` - 기술 연구 보너스
- [ ] `che_통찰.php` → `InsightSpecial.ts` - 첩보/정보 보너스
- [ ] `che_귀모.php` → `DivineStrategySpecial.ts` - 계략 보너스
- [ ] `che_거상.php` → `MerchantSpecial.ts` - (비활성화됨)

## 구현 패턴

```typescript
// packages/logic/src/domain/specials/CriticalSpecial.ts
import { BaseSpecial, SpecialContext, SpecialEffect } from './BaseSpecial.js';

export class CriticalSpecial extends BaseSpecial {
  readonly id = 'critical';
  readonly name = '필살';
  readonly category = 'war';

  getEffect(ctx: SpecialContext): SpecialEffect {
    return {
      criticalChanceBonus: 0.15,
      // 레거시: getCriticalProb() 참조
    };
  }
}
```

## 테스트 작성

```typescript
// packages/logic/src/domain/specials/CriticalSpecial.test.ts
import { describe, it, expect } from 'vitest';
import { CriticalSpecial } from './CriticalSpecial.js';

describe('CriticalSpecial', () => {
  it('should increase critical chance', () => {
    const special = new CriticalSpecial();
    const effect = special.getEffect({ /* context */ });
    expect(effect.criticalChanceBonus).toBeGreaterThan(0);
  });
});
```

## 레거시 참조 파일
- `legacy/hwe/sammo/ActionSpecialWar/` - 전투 특기
- `legacy/hwe/sammo/ActionSpecialDomestic/` - 내정 특기
- `legacy/hwe/sammo/BaseSpecial.php` - 기본 클래스
