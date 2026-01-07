# 웹 세션 1: 전투 트리거 시스템 구현

## 프로젝트 개요

삼국지 모의전투 게임의 레거시 PHP 코드를 TypeScript로 포팅하는 프로젝트입니다.

## 이 세션의 목표

전투 트리거 시스템 36개를 TypeScript로 구현

## 작업 환경

- 레거시: `legacy/hwe/sammo/WarUnitTrigger/` (PHP)
- 구현 위치: `packages/logic/src/domain/triggers/` (TypeScript)
- 테스트: `packages/logic/src/domain/triggers/*.test.ts`

## 기존 구현 참조

```typescript
// packages/logic/src/domain/triggers/InjuryReductionTrigger.ts 참조
```

## 구현할 트리거 목록 (36개)

### Phase 1: 필살/회피 (4개) - 최우선

```
1. che_필살시도.php → CriticalAttemptTrigger.ts
2. che_필살발동.php → CriticalActivateTrigger.ts
3. che_회피시도.php → EvasionAttemptTrigger.ts
4. che_회피발동.php → EvasionActivateTrigger.ts
```

### Phase 2: 계략 (3개)

```
5. che_계략시도.php → StrategyAttemptTrigger.ts
6. che_계략발동.php → StrategyActivateTrigger.ts
7. che_계략실패.php → StrategyFailTrigger.ts
```

### Phase 3: 저격/반계 (4개)

```
8. che_저격시도.php → SniperAttemptTrigger.ts
9. che_저격발동.php → SniperActivateTrigger.ts
10. che_반계시도.php → CounterAttemptTrigger.ts
11. che_반계발동.php → CounterActivateTrigger.ts
```

### Phase 4: 위압/약탈 (4개)

```
12. che_위압시도.php → IntimidationAttemptTrigger.ts
13. che_위압발동.php → IntimidationActivateTrigger.ts
14. che_약탈시도.php → LootAttemptTrigger.ts
15. che_약탈발동.php → LootActivateTrigger.ts
```

### Phase 5: 선제사격/돌격 (4개)

```
16. che_선제사격시도.php → PreemptiveFireAttemptTrigger.ts
17. che_선제사격발동.php → PreemptiveFireActivateTrigger.ts
18. che_돌격지속.php → ChargeContinueTrigger.ts
19. che_궁병선제사격.php → ArcherPreemptiveFireTrigger.ts
```

### Phase 6: 치료/저지 (4개)

```
20. che_전투치료시도.php → BattleHealAttemptTrigger.ts
21. che_전투치료발동.php → BattleHealActivateTrigger.ts
22. che_저지시도.php → BlockAttemptTrigger.ts
23. che_저지발동.php → BlockActivateTrigger.ts
```

### Phase 7: 격노 (2개)

```
24. che_격노시도.php → RageAttemptTrigger.ts
25. che_격노발동.php → RageActivateTrigger.ts
```

### Phase 8: 부상/보정 (7개)

```
26. che_부상무효.php → InjuryNullifyTrigger.ts
27. che_성벽부상무효.php → WallInjuryNullifyTrigger.ts
28. che_퇴각부상무효.php → RetreatInjuryNullifyTrigger.ts
29. che_방어력증가5p.php → DefenseBonus5Trigger.ts
30. che_필살강화_회피불가.php → CriticalEnhanceNoEvadeTrigger.ts
31. 능력치변경.php → StatChangeTrigger.ts
32. 전투력보정.php → CombatPowerModTrigger.ts
```

### Phase 9: 기타 (4개)

```
33. che_전멸시페이즈증가.php → PhaseIncreaseOnKillTrigger.ts
34. che_기병병종전투.php → CavalryBattleTrigger.ts
35. event_충차아이템소모.php → RamItemConsumeTrigger.ts
36. WarActivateSkills.php → WarActivateSkillsTrigger.ts
```

## 구현 템플릿

```typescript
// packages/logic/src/domain/triggers/CriticalAttemptTrigger.ts
import { RandUtil } from "@sammo-ts/common";
import { WorldSnapshot, General } from "../entities.js";

export interface TriggerContext {
  rand: RandUtil;
  snapshot: WorldSnapshot;
  attacker: General;
  defender: General;
  phase: number;
}

export interface TriggerResult {
  triggered: boolean;
  damage?: number;
  message?: string;
}

export class CriticalAttemptTrigger {
  readonly id = "critical_attempt";
  readonly priority = 100;

  canTrigger(ctx: TriggerContext): boolean {
    // 필살 특기 보유 확인
    return ctx.attacker.special === "critical" || ctx.attacker.special === "필살";
  }

  execute(ctx: TriggerContext): TriggerResult {
    const { rand, attacker } = ctx;

    // 기본 필살 확률: 10% + (무력/10)%
    const baseChance = 0.1 + attacker.strength / 1000;
    const roll = rand.nextFloat();

    if (roll < baseChance) {
      return {
        triggered: true,
        message: `${attacker.name}의 필살 발동!`,
      };
    }

    return { triggered: false };
  }
}
```

## 테스트 템플릿

```typescript
// packages/logic/src/domain/triggers/CriticalAttemptTrigger.test.ts
import { describe, it, expect } from "vitest";
import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { CriticalAttemptTrigger } from "./CriticalAttemptTrigger.js";

describe("CriticalAttemptTrigger", () => {
  const createContext = (overrides = {}) => {
    const rng = new LiteHashDRBG("test-seed");
    return {
      rand: new RandUtil(rng),
      attacker: {
        id: 1,
        name: "관우",
        special: "critical",
        strength: 95,
      },
      defender: {
        id: 2,
        name: "적장",
        special: "none",
        strength: 70,
      },
      phase: 1,
      ...overrides,
    };
  };

  it("should trigger for generals with critical special", () => {
    const trigger = new CriticalAttemptTrigger();
    const ctx = createContext();
    expect(trigger.canTrigger(ctx)).toBe(true);
  });

  it("should not trigger without critical special", () => {
    const trigger = new CriticalAttemptTrigger();
    const ctx = createContext({
      attacker: { ...createContext().attacker, special: "none" },
    });
    expect(trigger.canTrigger(ctx)).toBe(false);
  });
});
```

## 레거시 PHP 분석 가이드

각 PHP 파일에서 확인할 항목:

1. `tryAction()` 또는 `action()` 메서드 - 트리거 조건
2. 확률 계산 공식
3. 효과 적용 로직
4. 메시지 생성

## 진행 체크리스트

Phase 1 완료 후:

- [ ] CriticalAttemptTrigger.ts + test
- [ ] CriticalActivateTrigger.ts + test
- [ ] EvasionAttemptTrigger.ts + test
- [ ] EvasionActivateTrigger.ts + test

Phase 2 완료 후:

- [ ] StrategyAttemptTrigger.ts + test
- [ ] StrategyActivateTrigger.ts + test
- [ ] StrategyFailTrigger.ts + test

(이하 Phase 3-9 동일 패턴)

## 완료 기준

- 모든 36개 트리거 구현
- 각 트리거에 최소 2개 테스트
- `pnpm --filter @sammo-ts/logic test` 통과
