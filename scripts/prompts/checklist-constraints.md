# 제약 조건 시스템 구현 프롬프트

## 목표
레거시 PHP 제약 조건 시스템(73개)을 TypeScript로 포팅

## 레거시 파일 위치
`legacy/hwe/sammo/Constraint/`

## 현재 구현 상태
일부 제약 조건이 `packages/logic/src/domain/constraints/`에 구현됨

## 체크리스트

### Phase 1: 외교/전쟁 제약 (6개)
- [ ] AllowDiplomacyBetweenStatus.php → AllowDiplomacyBetweenStatus.ts
- [ ] AllowDiplomacyStatus.php → AllowDiplomacyStatus.ts
- [ ] AllowDiplomacyWithTerm.php → AllowDiplomacyWithTerm.ts
- [ ] AllowWar.php → AllowWar.ts
- [ ] DisallowDiplomacyBetweenStatus.php → DisallowDiplomacyBetweenStatus.ts
- [ ] DisallowDiplomacyStatus.php → DisallowDiplomacyStatus.ts

### Phase 2: 장수 상태 제약 (12개)
- [ ] BeChief.php → BeChief.ts (군주 여부)
- [ ] BeLord.php → BeLord.ts (태수 여부)
- [ ] BeNeutral.php → BeNeutral.ts (재야 여부)
- [ ] NotChief.php → NotChief.ts
- [ ] NotLord.php → NotLord.ts
- [ ] NotBeNeutral.php → NotBeNeutral.ts
- [ ] BeOpeningPart.php → BeOpeningPart.ts
- [ ] NotOpeningPart.php → NotOpeningPart.ts
- [ ] MustBeNPC.php → MustBeNPC.ts
- [ ] MustBeTroopLeader.php → MustBeTroopLeader.ts
- [ ] NotWanderingNation.php → NotWanderingNation.ts
- [ ] WanderingNation.php → WanderingNation.ts

### Phase 3: 장수 자원 제약 (8개)
- [ ] ReqGeneralGold.php → ReqGeneralGold.ts
- [ ] ReqGeneralRice.php → ReqGeneralRice.ts
- [ ] ReqGeneralCrew.php → ReqGeneralCrew.ts
- [ ] ReqGeneralCrewMargin.php → ReqGeneralCrewMargin.ts
- [ ] ReqGeneralTrainMargin.php → ReqGeneralTrainMargin.ts
- [ ] ReqGeneralAtmosMargin.php → ReqGeneralAtmosMargin.ts
- [ ] ReqGeneralValue.php → ReqGeneralValue.ts
- [ ] NoPenalty.php → NoPenalty.ts

### Phase 4: 국가 자원 제약 (6개)
- [ ] ReqNationGold.php → ReqNationGold.ts
- [ ] ReqNationRice.php → ReqNationRice.ts
- [ ] ReqNationValue.php → ReqNationValue.ts
- [ ] ReqNationAuxValue.php → ReqNationAuxValue.ts
- [ ] ReqTroopMembers.php → ReqTroopMembers.ts
- [ ] AllowStrategicCommand.php → AllowStrategicCommand.ts

### Phase 5: 도시 제약 (18개)
- [ ] NearCity.php → NearCity.ts
- [ ] NearNation.php → NearNation.ts
- [ ] NeutralCity.php → NeutralCity.ts
- [ ] OccupiedCity.php → OccupiedCity.ts
- [ ] OccupiedDestCity.php → OccupiedDestCity.ts
- [ ] NotOccupiedCity.php → NotOccupiedCity.ts
- [ ] NotOccupiedDestCity.php → NotOccupiedDestCity.ts
- [ ] NotCapital.php → NotCapital.ts
- [ ] NotNeutralDestCity.php → NotNeutralDestCity.ts
- [ ] NotSameDestCity.php → NotSameDestCity.ts
- [ ] SuppliedCity.php → SuppliedCity.ts
- [ ] SuppliedDestCity.php → SuppliedDestCity.ts
- [ ] ConstructableCity.php → ConstructableCity.ts
- [ ] BattleGroundCity.php → BattleGroundCity.ts
- [ ] ReqCityCapacity.php → ReqCityCapacity.ts
- [ ] ReqCityTrader.php → ReqCityTrader.ts
- [ ] ReqCityTrust.php → ReqCityTrust.ts
- [ ] ReqCityValue.php → ReqCityValue.ts

### Phase 6: 경로/거리 제약 (4개)
- [ ] HasRoute.php → HasRoute.ts
- [ ] HasRouteWithEnemy.php → HasRouteWithEnemy.ts
- [ ] RemainCityCapacity.php → RemainCityCapacity.ts
- [ ] RemainCityTrust.php → RemainCityTrust.ts

### Phase 7: 대상 장수/국가 제약 (8개)
- [ ] ExistsDestGeneral.php → ExistsDestGeneral.ts
- [ ] ExistsDestNation.php → ExistsDestNation.ts
- [ ] ExistsAllowJoinNation.php → ExistsAllowJoinNation.ts
- [ ] FriendlyDestGeneral.php → FriendlyDestGeneral.ts
- [ ] DifferentDestNation.php → DifferentDestNation.ts
- [ ] DifferentNationDestGeneral.php → DifferentNationDestGeneral.ts
- [ ] ReqDestCityValue.php → ReqDestCityValue.ts
- [ ] ReqDestNationValue.php → ReqDestNationValue.ts

### Phase 8: 특수 제약 (11개)
- [ ] AllowJoinAction.php → AllowJoinAction.ts
- [ ] AllowJoinDestNation.php → AllowJoinDestNation.ts
- [ ] AllowRebellion.php → AllowRebellion.ts
- [ ] AvailableRecruitCrewType.php → AvailableRecruitCrewType.ts
- [ ] AvailableStrategicCommand.php → AvailableStrategicCommand.ts
- [ ] CheckNationNameDuplicate.php → CheckNationNameDuplicate.ts
- [ ] ReqEnvValue.php → ReqEnvValue.ts
- [ ] AdhocCallback.php → AdhocCallback.ts
- [ ] AlwaysFail.php → AlwaysFail.ts
- [ ] Constraint.php → BaseConstraint.ts (기본 클래스)
- [ ] ConstraintHelper.php → ConstraintHelper.ts

## 구현 패턴

```typescript
// packages/logic/src/domain/constraints/BaseConstraint.ts
export interface ConstraintResult {
  success: boolean;
  reason?: string;
}

export abstract class BaseConstraint {
  abstract readonly id: string;
  abstract check(ctx: ConstraintContext): ConstraintResult;
}
```

```typescript
// packages/logic/src/domain/constraints/ReqGeneralGold.ts
import { BaseConstraint, ConstraintResult } from './BaseConstraint.js';

export class ReqGeneralGold extends BaseConstraint {
  readonly id = 'req_general_gold';

  constructor(private minGold: number) {
    super();
  }

  check(ctx: ConstraintContext): ConstraintResult {
    if (ctx.general.gold < this.minGold) {
      return {
        success: false,
        reason: `금이 ${this.minGold} 이상 필요합니다. (현재: ${ctx.general.gold})`,
      };
    }
    return { success: true };
  }
}
```

## 제약 조건 조합 패턴

```typescript
// 커맨드에서 제약 조건 사용
class SomeCommand extends BaseCommand {
  constraints = [
    new ReqGeneralGold(100),
    new ReqGeneralCrew(1000),
    new NearCity(),
    new AllowWar(),
  ];
}
```

## 레거시 참조
- `legacy/hwe/sammo/Constraint/`
- `legacy/hwe/sammo/Constraint/Constraint.php` (기본 클래스)
- `legacy/hwe/sammo/Constraint/ConstraintHelper.php` (헬퍼)
