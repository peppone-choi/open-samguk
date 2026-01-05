# 전투 트리거 시스템 구현 프롬프트

## 목표
레거시 PHP 전투 트리거 시스템을 TypeScript로 포팅

## 사전 조건
1. `packages/logic/src/domain/triggers/` 구조 분석 완료
2. 레거시 `legacy/hwe/sammo/WarUnitTrigger/` 분석 완료

## 체크리스트

### Phase 1: 필살/회피 시스템 (4개)
- [ ] `che_필살시도.php` → `CriticalAttemptTrigger.ts`
- [ ] `che_필살발동.php` → `CriticalActivateTrigger.ts`
- [ ] `che_회피시도.php` → `EvasionAttemptTrigger.ts`
- [ ] `che_회피발동.php` → `EvasionActivateTrigger.ts`

### Phase 2: 계략 시스템 (3개)
- [ ] `che_계략시도.php` → `StrategyAttemptTrigger.ts`
- [ ] `che_계략발동.php` → `StrategyActivateTrigger.ts`
- [ ] `che_계략실패.php` → `StrategyFailTrigger.ts`

### Phase 3: 저격/반계 시스템 (4개)
- [ ] `che_저격시도.php` → `SniperAttemptTrigger.ts`
- [ ] `che_저격발동.php` → `SniperActivateTrigger.ts`
- [ ] `che_반계시도.php` → `CounterAttemptTrigger.ts`
- [ ] `che_반계발동.php` → `CounterActivateTrigger.ts`

### Phase 4: 위압/약탈 시스템 (4개)
- [ ] `che_위압시도.php` → `IntimidationAttemptTrigger.ts`
- [ ] `che_위압발동.php` → `IntimidationActivateTrigger.ts`
- [ ] `che_약탈시도.php` → `LootAttemptTrigger.ts`
- [ ] `che_약탈발동.php` → `LootActivateTrigger.ts`

### Phase 5: 사격/돌격 시스템 (4개)
- [ ] `che_선제사격시도.php` → `PreemptiveFireAttemptTrigger.ts`
- [ ] `che_선제사격발동.php` → `PreemptiveFireActivateTrigger.ts`
- [ ] `che_돌격지속.php` → `ChargeContinueTrigger.ts`
- [ ] `che_궁병선제사격.php` → `ArcherPreemptiveFireTrigger.ts`

### Phase 6: 치료/저지 시스템 (4개)
- [ ] `che_전투치료시도.php` → `BattleHealAttemptTrigger.ts`
- [ ] `che_전투치료발동.php` → `BattleHealActivateTrigger.ts`
- [ ] `che_저지시도.php` → `BlockAttemptTrigger.ts`
- [ ] `che_저지발동.php` → `BlockActivateTrigger.ts`

### Phase 7: 격노 시스템 (2개)
- [ ] `che_격노시도.php` → `RageAttemptTrigger.ts`
- [ ] `che_격노발동.php` → `RageActivateTrigger.ts`

### Phase 8: 부상/보정 시스템 (7개)
- [ ] `che_부상무효.php` → `InjuryNullifyTrigger.ts`
- [ ] `che_성벽부상무효.php` → `WallInjuryNullifyTrigger.ts`
- [ ] `che_퇴각부상무효.php` → `RetreatInjuryNullifyTrigger.ts`
- [ ] `che_방어력증가5p.php` → `DefenseBonus5Trigger.ts`
- [ ] `che_필살강화_회피불가.php` → `CriticalEnhanceNoEvadeTrigger.ts`
- [ ] `능력치변경.php` → `StatChangeTrigger.ts`
- [ ] `전투력보정.php` → `CombatPowerModTrigger.ts`

### Phase 9: 기타 (4개)
- [ ] `che_전멸시페이즈증가.php` → `PhaseIncreaseOnKillTrigger.ts`
- [ ] `che_기병병종전투.php` → `CavalryBattleTrigger.ts`
- [ ] `event_충차아이템소모.php` → `RamItemConsumeTrigger.ts`
- [ ] `WarActivateSkills.php` → `WarActivateSkillsTrigger.ts`

## 구현 패턴

```typescript
// packages/logic/src/domain/triggers/CriticalAttemptTrigger.ts
import { WarUnitTrigger, TriggerContext, TriggerResult } from './types.js';

export class CriticalAttemptTrigger implements WarUnitTrigger {
  readonly id = 'critical_attempt';
  readonly phase = 'combat';
  readonly priority = 100;

  canAttempt(ctx: TriggerContext): boolean {
    // 필살 시도 가능 조건 확인
    return ctx.attacker.special === 'critical';
  }

  attempt(ctx: TriggerContext): TriggerResult {
    const baseChance = 0.1;
    const roll = ctx.rand.nextFloat();
    return {
      success: roll < baseChance,
      consumed: false,
    };
  }
}
```

## 트리거 우선순위 규칙
1. 선제 사격 트리거 (priority: 200)
2. 필살/회피 트리거 (priority: 100)
3. 계략 트리거 (priority: 90)
4. 저격/반계 트리거 (priority: 80)
5. 위압/약탈 트리거 (priority: 70)
6. 부상 무효 트리거 (priority: 50)
7. 전투력 보정 트리거 (priority: 10)

## 레거시 참조 파일
- `legacy/hwe/sammo/WarUnitTrigger/` - 전투 트리거
- `legacy/hwe/sammo/WarUnitTriggerHelper.php` - 헬퍼 함수
