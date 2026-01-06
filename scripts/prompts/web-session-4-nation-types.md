# 웹 세션 4: 국가 성향 + 제약 조건 구현

## 프로젝트 개요
삼국지 모의전투 게임의 레거시 PHP 코드를 TypeScript로 포팅하는 프로젝트입니다.

## 이 세션의 목표
1. 국가 성향 15개 구현
2. 제약 조건 중요 항목 30개 구현

## 작업 환경
- 레거시 성향: `legacy/hwe/sammo/ActionNationType/` (PHP)
- 레거시 제약: `legacy/hwe/sammo/Constraint/` (PHP)
- 구현 위치: `packages/logic/src/domain/nation-types/` (새로 생성)
- 구현 위치: `packages/logic/src/domain/constraints/` (TypeScript)

---

# Part A: 국가 성향 (15개)

## 구현할 국가 성향

### 유가 계열 (4개)
```
1. che_덕가.php → VirtueNationType.ts
   - 민심 +20%, 충성도 +10%
   - 전투력 -10%

2. che_유가.php → ConfucianNationType.ts
   - 내정 효율 +15%
   - 전투력 -5%

3. che_명가.php → LogicianNationType.ts
   - 지력 관련 +10%
   - 무력 -5%

4. che_묵가.php → MohistNationType.ts
   - 방어력 +20%, 성벽 +15%
   - 공격력 -10%
```

### 병가/법가 계열 (3개)
```
5. che_법가.php → LegalistNationType.ts
   - 세금 효율 +15%, 질서 +10%
   - 민심 -15%

6. che_병가.php → MilitaristNationType.ts
   - 전투력 +10%, 훈련 효율 +20%
   - 내정 효율 -10%

7. che_도적.php → BanditNationType.ts
   - 약탈 +50%, 모병 +20%
   - 외교 불가, 민심 -20%
```

### 도가/불가 계열 (3개)
```
8. che_도가.php → TaoistNationType.ts
   - 계략 +20%, 회피 +15%
   - 공격력 -10%

9. che_불가.php → BuddhistNationType.ts
   - 회복 +30%, 치료 +20%
   - 공격력 -15%

10. che_음양가.php → YinYangNationType.ts
    - 계략 +25%
    - 직접 전투 -15%
```

### 종교 계열 (3개)
```
11. che_태평도.php → TaipingNationType.ts
    - 민심 +25%, 모병 +15%
    - 기술 -10%

12. che_오두미도.php → WudoumiNationType.ts
    - 병력 유지비 -20%
    - 기술 -15%

13. che_종횡가.php → DiplomatNationType.ts
    - 외교 +30%
    - 전투력 -10%
```

### 기본 (2개)
```
14. None.php → NoneNationType.ts
    - 보너스/페널티 없음

15. che_중립.php → NeutralNationType.ts
    - 외교 +10%
    - 전투력 -5%
```

## 국가 성향 구현 템플릿

```typescript
// packages/logic/src/domain/nation-types/BaseNationType.ts
export interface NationTypeEffect {
  // 전투 관련
  attackBonus?: number;
  defenseBonus?: number;
  criticalBonus?: number;
  evasionBonus?: number;

  // 내정 관련
  agricultureEfficiency?: number;
  commerceEfficiency?: number;
  securityEfficiency?: number;
  technologyEfficiency?: number;

  // 징병/유지
  conscriptEfficiency?: number;
  maintenanceCost?: number;

  // 외교
  diplomacyBonus?: number;
  canDiplomacy?: boolean;

  // 기타
  trustBonus?: number;
  loyaltyBonus?: number;
}

export abstract class BaseNationType {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract getEffect(): NationTypeEffect;
  abstract getSpecialCommands(): string[];
}
```

```typescript
// packages/logic/src/domain/nation-types/MilitaristNationType.ts
import { BaseNationType, NationTypeEffect } from './BaseNationType.js';

export class MilitaristNationType extends BaseNationType {
  readonly id = 'militarist';
  readonly name = '병가';
  readonly description = '전투와 병법에 특화된 성향';

  getEffect(): NationTypeEffect {
    return {
      // 전투 보너스
      attackBonus: 0.1,           // +10%
      defenseBonus: 0.05,         // +5%

      // 훈련 효율
      conscriptEfficiency: 1.2,   // +20%

      // 내정 페널티
      agricultureEfficiency: 0.9,  // -10%
      commerceEfficiency: 0.9,     // -10%
    };
  }

  getSpecialCommands(): string[] {
    return ['nation_forced_march', 'nation_military_drill'];
  }
}
```

---

# Part B: 제약 조건 (30개)

## 구현할 제약 조건

### 장수 상태 (8개)
```
1. BeChief.php → BeChiefConstraint.ts
2. BeLord.php → BeLordConstraint.ts
3. BeNeutral.php → BeNeutralConstraint.ts
4. NotChief.php → NotChiefConstraint.ts
5. NotLord.php → NotLordConstraint.ts
6. NotBeNeutral.php → NotBeNeutralConstraint.ts
7. MustBeTroopLeader.php → MustBeTroopLeaderConstraint.ts
8. MustBeNPC.php → MustBeNPCConstraint.ts
```

### 자원 요구 (8개)
```
9. ReqGeneralGold.php → ReqGeneralGoldConstraint.ts
10. ReqGeneralRice.php → ReqGeneralRiceConstraint.ts
11. ReqGeneralCrew.php → ReqGeneralCrewConstraint.ts
12. ReqNationGold.php → ReqNationGoldConstraint.ts
13. ReqNationRice.php → ReqNationRiceConstraint.ts
14. ReqCityTrust.php → ReqCityTrustConstraint.ts
15. ReqCityValue.php → ReqCityValueConstraint.ts
16. ReqEnvValue.php → ReqEnvValueConstraint.ts
```

### 도시/경로 (8개)
```
17. NearCity.php → NearCityConstraint.ts
18. NearNation.php → NearNationConstraint.ts
19. HasRoute.php → HasRouteConstraint.ts
20. OccupiedCity.php → OccupiedCityConstraint.ts
21. NeutralCity.php → NeutralCityConstraint.ts
22. SuppliedCity.php → SuppliedCityConstraint.ts
23. NotCapital.php → NotCapitalConstraint.ts
24. ConstructableCity.php → ConstructableCityConstraint.ts
```

### 외교/전쟁 (6개)
```
25. AllowWar.php → AllowWarConstraint.ts
26. AllowDiplomacyStatus.php → AllowDiplomacyStatusConstraint.ts
27. DisallowDiplomacyStatus.php → DisallowDiplomacyStatusConstraint.ts
28. AllowRebellion.php → AllowRebellionConstraint.ts
29. AllowStrategicCommand.php → AllowStrategicCommandConstraint.ts
30. ExistsDestNation.php → ExistsDestNationConstraint.ts
```

## 제약 조건 구현 템플릿

```typescript
// packages/logic/src/domain/constraints/BaseConstraint.ts
import { WorldSnapshot, General, Nation, City } from '../entities.js';

export interface ConstraintContext {
  snapshot: WorldSnapshot;
  general: General;
  nation?: Nation;
  city?: City;
  targetCity?: City;
  targetNation?: Nation;
}

export interface ConstraintResult {
  valid: boolean;
  reason?: string;
}

export abstract class BaseConstraint {
  abstract readonly id: string;
  abstract check(ctx: ConstraintContext): ConstraintResult;
}
```

```typescript
// packages/logic/src/domain/constraints/ReqGeneralGoldConstraint.ts
import { BaseConstraint, ConstraintContext, ConstraintResult } from './BaseConstraint.js';

export class ReqGeneralGoldConstraint extends BaseConstraint {
  readonly id = 'req_general_gold';

  constructor(private minGold: number) {
    super();
  }

  check(ctx: ConstraintContext): ConstraintResult {
    const { general } = ctx;

    if (general.gold < this.minGold) {
      return {
        valid: false,
        reason: `금이 부족합니다. (필요: ${this.minGold}, 보유: ${general.gold})`,
      };
    }

    return { valid: true };
  }
}
```

```typescript
// packages/logic/src/domain/constraints/NearCityConstraint.ts
import { BaseConstraint, ConstraintContext, ConstraintResult } from './BaseConstraint.js';

export class NearCityConstraint extends BaseConstraint {
  readonly id = 'near_city';

  check(ctx: ConstraintContext): ConstraintResult {
    const { general, targetCity, snapshot } = ctx;

    if (!targetCity) {
      return { valid: false, reason: '대상 도시가 지정되지 않았습니다.' };
    }

    const currentCity = snapshot.cities[general.cityId];
    if (!currentCity) {
      return { valid: false, reason: '현재 위치를 확인할 수 없습니다.' };
    }

    // 인접 도시 확인 (맵 데이터 필요)
    const isAdjacent = this.checkAdjacency(currentCity.id, targetCity.id, snapshot);

    if (!isAdjacent) {
      return {
        valid: false,
        reason: `${targetCity.name}은(는) 인접 도시가 아닙니다.`,
      };
    }

    return { valid: true };
  }

  private checkAdjacency(cityA: number, cityB: number, snapshot: WorldSnapshot): boolean {
    // 맵 데이터에서 인접 여부 확인
    // TODO: 실제 맵 데이터 구조에 맞게 구현
    return true;
  }
}
```

## 테스트 템플릿

```typescript
// packages/logic/src/domain/nation-types/MilitaristNationType.test.ts
import { describe, it, expect } from 'vitest';
import { MilitaristNationType } from './MilitaristNationType.js';

describe('MilitaristNationType', () => {
  it('should have attack bonus', () => {
    const nationType = new MilitaristNationType();
    const effect = nationType.getEffect();

    expect(effect.attackBonus).toBe(0.1);
  });

  it('should have agriculture penalty', () => {
    const nationType = new MilitaristNationType();
    const effect = nationType.getEffect();

    expect(effect.agricultureEfficiency).toBe(0.9);
  });
});
```

```typescript
// packages/logic/src/domain/constraints/ReqGeneralGoldConstraint.test.ts
import { describe, it, expect } from 'vitest';
import { ReqGeneralGoldConstraint } from './ReqGeneralGoldConstraint.js';

describe('ReqGeneralGoldConstraint', () => {
  it('should pass when general has enough gold', () => {
    const constraint = new ReqGeneralGoldConstraint(100);
    const result = constraint.check({
      general: { gold: 150 },
      snapshot: {},
    });

    expect(result.valid).toBe(true);
  });

  it('should fail when general lacks gold', () => {
    const constraint = new ReqGeneralGoldConstraint(100);
    const result = constraint.check({
      general: { gold: 50 },
      snapshot: {},
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('금이 부족');
  });
});
```

## 진행 체크리스트

국가 성향:
- [ ] BaseNationType.ts
- [ ] VirtueNationType + test
- [ ] ConfucianNationType + test
- [ ] MilitaristNationType + test
- [ ] LegalistNationType + test
- [ ] ... (나머지 11개)

제약 조건:
- [ ] BeChiefConstraint + test
- [ ] ReqGeneralGoldConstraint + test
- [ ] NearCityConstraint + test
- [ ] AllowWarConstraint + test
- [ ] ... (나머지 26개)

## 완료 기준
- 국가 성향 15개 구현
- 제약 조건 30개 구현
- 각 항목에 최소 2개 테스트
- `pnpm --filter @sammo-ts/logic test` 통과
