# Agent 3: 특기 시스템 마이그레이션

## 업무 범위
전투 특기와 내정 특기 시스템을 TypeScript로 포팅

## 대상 디렉토리
- 소스1: `legacy/hwe/sammo/ActionSpecialWar/*.php` (21개 파일)
- 소스2: `legacy/hwe/sammo/ActionSpecialDomestic/*.php` (30개 파일)
- 타겟: `packages/logic/src/domain/specials/`

## 전투 특기 체크리스트 (ActionSpecialWar)

- [ ] None.php → NoSpecialWar.ts (기본값)
- [ ] che_공성.php → SiegeSpecial.ts
- [ ] che_격노.php → FurySpecial.ts
- [ ] che_견고.php → FortifySpecial.ts
- [ ] che_귀병.php → GhostSpecial.ts
- [ ] che_기병.php → CavalrySpecial.ts
- [ ] che_궁병.php → ArcherySpecial.ts
- [ ] che_돌격.php → ChargeSpecial.ts
- [ ] che_무쌍.php → UnrivaledSpecial.ts
- [ ] che_보병.php → InfantrySpecial.ts
- [ ] che_반계.php → CounterStrategySpecial.ts
- [ ] che_위압.php → IntimidationSpecial.ts
- [ ] che_신중.php → CautiousSpecial.ts
- [ ] che_신산.php → DivineCalculationSpecial.ts
- [ ] che_저격.php → SniperSpecial.ts
- [ ] che_의술.php → MedicineSpecial.ts
- [ ] che_집중.php → FocusSpecial.ts
- [ ] che_척사.php → ExorcismSpecial.ts
- [ ] che_징병.php → DraftSpecial.ts
- [ ] che_필살.php → CriticalSpecial.ts
- [ ] che_환술.php → IllusionSpecial.ts

## 내정 특기 체크리스트 (ActionSpecialDomestic)

### 순수 내정 특기
- [ ] None.php → NoSpecialDomestic.ts
- [ ] che_경작.php → FarmingSpecial.ts
- [ ] che_거상.php → MerchantSpecial.ts
- [ ] che_수비.php → DefenseSpecial.ts
- [ ] che_발명.php → InventionSpecial.ts
- [ ] che_귀모.php → DivineStrategySpecial.ts
- [ ] che_상재.php → CommerceSpecial.ts
- [ ] che_통찰.php → InsightSpecial.ts
- [ ] che_축성.php → ConstructionSpecial.ts
- [ ] che_인덕.php → BenevolenceSpecial.ts

### 이벤트 내정 특기 (전투 특기 획득용)
- [ ] che_event_격노.php
- [ ] che_event_공성.php
- [ ] che_event_견고.php
- [ ] che_event_궁병.php
- [ ] che_event_기병.php
- [ ] che_event_귀병.php
- [ ] che_event_돌격.php
- [ ] che_event_무쌍.php
- [ ] che_event_반계.php
- [ ] che_event_위압.php
- [ ] che_event_신중.php
- [ ] che_event_신산.php
- [ ] che_event_보병.php
- [ ] che_event_저격.php
- [ ] che_event_집중.php
- [ ] che_event_의술.php
- [ ] che_event_필살.php
- [ ] che_event_척사.php
- [ ] che_event_징병.php
- [ ] che_event_환술.php

## 포팅 규칙
1. `BaseSpecial` 인터페이스 정의
2. 전투 효과 수치 (공격력/방어력 보정 등) 정확히 포팅
3. 발동 조건 및 확률 로직 구현
4. 트리거와의 연동 고려

## 파일 구조
```typescript
// packages/logic/src/domain/specials/types.ts
export interface SpecialWar {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  // 전투 수치 보정
  modifyAttack?(base: number, context: BattleContext): number;
  modifyDefense?(base: number, context: BattleContext): number;

  // 특수 효과
  onBattleStart?(context: BattleContext): void;
  onBattleEnd?(context: BattleContext): void;
  onAttack?(context: BattleContext): void;
  onDefend?(context: BattleContext): void;
}

export interface SpecialDomestic {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  // 내정 효과 보정
  modifyDevelopment?(type: string, base: number, context: DomesticContext): number;
  modifyGold?(base: number, context: DomesticContext): number;
  modifyRice?(base: number, context: DomesticContext): number;
}
```
