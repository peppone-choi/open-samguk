# Agent 8: Constraint 시스템 마이그레이션

## 업무 범위
제약 조건 시스템을 TypeScript로 포팅

## 대상 디렉토리
- 소스: `legacy/hwe/sammo/Constraint/*.php` (73개 파일)
- 타겟: `packages/logic/src/domain/constraints/`

## 현재 포팅 상태
- [x] Constraint.ts (베이스 인터페이스)
- [x] ConstraintHelper.ts (일부 헬퍼)

## Constraint 파일 목록 확인
```bash
ls legacy/hwe/sammo/Constraint/
```

## 체크리스트 (예상)

### 장수 관련 제약
- [ ] BeNeutral.php → BeNeutralConstraint.ts
- [ ] NotBeNeutral.php → NotBeNeutralConstraint.ts
- [ ] BeLord.php → BeLordConstraint.ts
- [ ] NotLord.php → NotLordConstraint.ts
- [ ] BeChief.php → BeChiefConstraint.ts
- [ ] ReqGeneralValue.php → ReqGeneralValueConstraint.ts
- [ ] ReqGeneralGold.php → ReqGeneralGoldConstraint.ts
- [ ] ReqGeneralRice.php → ReqGeneralRiceConstraint.ts
- [ ] ReqGeneralCrew.php → ReqGeneralCrewConstraint.ts
- [ ] ReqGeneralTrainMargin.php → ReqGeneralTrainMarginConstraint.ts
- [ ] ReqGeneralAtmosMargin.php → ReqGeneralAtmosMarginConstraint.ts

### 도시 관련 제약
- [ ] OccupiedCity.php → OccupiedCityConstraint.ts
- [ ] NotOccupiedCity.php → NotOccupiedCityConstraint.ts
- [ ] SuppliedCity.php → SuppliedCityConstraint.ts
- [ ] FrontCity.php → FrontCityConstraint.ts

### 국가 관련 제약
- [ ] WanderingNation.php → WanderingNationConstraint.ts
- [ ] NotWanderingNation.php → NotWanderingNationConstraint.ts
- [ ] ReqNationValue.php → ReqNationValueConstraint.ts

### 대상 관련 제약
- [ ] ExistsDestGeneral.php → ExistsDestGeneralConstraint.ts
- [ ] FriendlyDestGeneral.php → FriendlyDestGeneralConstraint.ts
- [ ] ExistsDestNation.php → ExistsDestNationConstraint.ts
- [ ] ExistsDestCity.php → ExistsDestCityConstraint.ts

### 환경 관련 제약
- [ ] ReqEnvValue.php → ReqEnvValueConstraint.ts
- [ ] BeOpeningPart.php → BeOpeningPartConstraint.ts
- [ ] AllowJoinAction.php → AllowJoinActionConstraint.ts
- [ ] AllowRebellion.php → AllowRebellionConstraint.ts

### 기타 제약
- [ ] CheckNationNameDuplicate.php → CheckNationNameDuplicateConstraint.ts
- [ ] (기타 제약들)

## 포팅 규칙
1. 각 제약조건은 `Constraint` 인터페이스 구현
2. `requires()` 메서드로 필요 데이터 선언
3. `test()` 메서드로 검증 로직 구현
4. allow/deny/unknown 결과 반환

## 파일 구조
```typescript
// packages/logic/src/domain/constraints/BeNeutralConstraint.ts
import { Constraint, ConstraintContext, ConstraintResult, RequirementKey, StateView } from './types.js';

export class BeNeutralConstraint implements Constraint {
  readonly name = 'BeNeutral';

  requires(ctx: ConstraintContext): RequirementKey[] {
    return [{ kind: 'general', id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: 'general', id: ctx.actorId });
    if (!general) {
      return { kind: 'unknown', missing: [{ kind: 'general', id: ctx.actorId }] };
    }
    if (general.nationId === 0) {
      return { kind: 'allow' };
    }
    return { kind: 'deny', reason: '재야 상태여야 합니다.' };
  }
}
```
