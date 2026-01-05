# Agent 5: 트리거 시스템 마이그레이션

## 업무 범위
GeneralTrigger와 WarUnitTrigger 시스템을 TypeScript로 포팅

## 대상 디렉토리
- 소스1: `legacy/hwe/sammo/GeneralTrigger/*.php` (4개 파일)
- 소스2: `legacy/hwe/sammo/WarUnitTrigger/*.php` (36개 파일)
- 소스3: `legacy/hwe/sammo/*Trigger*.php` (베이스 클래스)
- 타겟: `packages/logic/src/domain/triggers/`

## GeneralTrigger 체크리스트

확인 필요:
```bash
ls legacy/hwe/sammo/GeneralTrigger/
```

### 베이스 파일
- [ ] BaseGeneralTrigger.php → BaseGeneralTrigger.ts
- [ ] GeneralTriggerCaller.php → GeneralTriggerCaller.ts
- [ ] TriggerCaller.php → TriggerCaller.ts
- [ ] TriggerInheritBuff.php → TriggerInheritBuff.ts
- [ ] TriggerOfficerLevel.php → TriggerOfficerLevel.ts

### 이미 포팅된 트리거
- [x] SoldierMaintenanceTrigger.ts (병력군량소모)

## WarUnitTrigger 체크리스트

### 전투 중 트리거
- [ ] che_필살발동 → CriticalAttackTrigger.ts
- [ ] che_회피발동 → EvasionTrigger.ts
- [ ] che_회피시도 → EvasionAttemptTrigger.ts
- [ ] che_전멸시페이즈증가 → PhaseIncreaseOnVictoryTrigger.ts
- [ ] che_계략시도 → StrategyAttemptTrigger.ts
- [ ] che_계략발동 → StrategyActivationTrigger.ts
- [ ] che_계략실패 → StrategyFailureTrigger.ts
- [ ] che_선제사격시도 → PreemptiveFireAttemptTrigger.ts
- [ ] che_선제사격발동 → PreemptiveFireActivationTrigger.ts
- [ ] che_약탈시도 → LootAttemptTrigger.ts
- [ ] che_약탈발동 → LootActivationTrigger.ts
- [ ] che_위압시도 → IntimidationAttemptTrigger.ts
- [ ] che_위압발동 → IntimidationActivationTrigger.ts
- [ ] che_저격시도 → SniperAttemptTrigger.ts
- [ ] che_저격발동 → SniperActivationTrigger.ts
- [ ] che_반계시도 → CounterStrategyAttemptTrigger.ts
- [ ] che_반계발동 → CounterStrategyActivationTrigger.ts

### 기타 트리거
- [ ] che_부상경감 → InjuryReductionTrigger.ts
- [ ] che_도시치료 → CityCureTrigger.ts
- [ ] che_아이템치료 → ItemCureTrigger.ts

## 포팅 규칙
1. 트리거 발동 시점 명확히 정의
2. attempt/execute 2단계 구조 유지
3. 우선순위 규칙 구현
4. 트리거 체인 처리

## 파일 구조
```typescript
// packages/logic/src/domain/triggers/types.ts
export interface TriggerContext {
  phase: 'attempt' | 'execute';
  source: 'general' | 'warunit';
  actorId: number;
  targetId?: number;
  args: Record<string, any>;
}

export interface Trigger {
  readonly id: string;
  readonly name: string;
  readonly priority: number;

  shouldActivate(context: TriggerContext): boolean;
  execute(context: TriggerContext): TriggerResult;
}

export interface TriggerResult {
  prevented?: boolean;
  modified?: Record<string, any>;
  logs?: string[];
}

// packages/logic/src/domain/triggers/TriggerCaller.ts
export class TriggerCaller {
  private triggers: Trigger[] = [];

  register(trigger: Trigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => b.priority - a.priority);
  }

  call(context: TriggerContext): TriggerResult[] {
    const results: TriggerResult[] = [];
    for (const trigger of this.triggers) {
      if (trigger.shouldActivate(context)) {
        results.push(trigger.execute(context));
      }
    }
    return results;
  }
}
```
