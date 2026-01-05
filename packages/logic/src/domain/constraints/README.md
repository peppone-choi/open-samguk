# Constraint System Migration

레거시 PHP Constraint 시스템을 TypeScript로 마이그레이션한 모듈입니다.

## 개요

총 73개의 PHP 제약조건 중 우선순위가 높은 20개의 제약조건을 TypeScript로 마이그레이션했습니다.

## 마이그레이션된 제약조건

### General (장수) 관련 제약조건

- `BeChiefConstraint` - 수뇌여야 함 (officer_level > 4)
- `NotChiefConstraint` - 수뇌가 아니어야 함 (officer_level <= 4)
- `NotLordConstraint` - 군주가 아니어야 함 (officer_level != 12)

### City (도시) 관련 제약조건

- `NeutralCityConstraint` - 공백지여야 함 (nationId === 0)
- `NotOccupiedCityConstraint` - 아국이 아니어야 함

### DestCity (대상 도시) 관련 제약조건

- `NotNeutralDestCityConstraint` - 대상 도시가 공백지가 아니어야 함
- `OccupiedDestCityConstraint` - 대상 도시가 아국이어야 함
- `NotOccupiedDestCityConstraint` - 대상 도시가 아국이 아니어야 함
- `SuppliedDestCityConstraint` - 대상 도시가 보급이 연결되어 있어야 함
- `NotSameDestCityConstraint` - 대상 도시가 현재 도시와 달라야 함

### Nation (국가) 관련 제약조건

- `ReqNationGoldConstraint` - 국가 자금이 충분해야 함
- `ReqNationRiceConstraint` - 국가 군량이 충분해야 함

### DestNation (대상 국가) 관련 제약조건

- `ExistsDestNationConstraint` - 대상 국가가 존재해야 함
- `DifferentDestNationConstraint` - 대상 국가가 현재 국가와 달라야 함

### 범용 값 검사 제약조건

- `ReqGeneralValueConstraint` - 범용 장수 변수 검사
- `ReqNationValueConstraint` - 범용 국가 변수 검사 (퍼센트 지원)
- `ReqCityValueConstraint` - 범용 도시 변수 검사 (퍼센트 지원)
- `ReqDestCityValueConstraint` - 범용 대상 도시 변수 검사 (퍼센트 지원)
- `ReqDestNationValueConstraint` - 범용 대상 국가 변수 검사 (퍼센트 지원)

### 기타 제약조건

- `NotCapitalConstraint` - 수도가 아니어야 함 (수뇌 예외 지원)

## 사용 방법

### 1. 직접 인스턴스 생성

```typescript
import { BeChiefConstraint } from "./constraints/BeChiefConstraint.js";

const constraint = new BeChiefConstraint();
```

### 2. ConstraintHelper 사용 (권장)

```typescript
import { ConstraintHelper } from "./ConstraintHelper.js";

const constraints = [
  ConstraintHelper.BeChief(),
  ConstraintHelper.NotBeNeutral(),
  ConstraintHelper.ReqGeneralGold(1000),
  ConstraintHelper.ReqGeneralValue("leadership", "통솔", ">=", 80),
  ConstraintHelper.ReqNationValue("gold", "국고", ">=", "50%"), // 퍼센트 지원
];
```

## 범용 제약조건 사용 예시

### ReqGeneralValue

```typescript
// 통솔력 80 이상 요구
ConstraintHelper.ReqGeneralValue("leadership", "통솔", ">=", 80);

// 무력 50 초과 요구
ConstraintHelper.ReqGeneralValue("strength", "무력", ">", 50);

// 사용자 정의 에러 메시지
ConstraintHelper.ReqGeneralValue(
  "gold",
  "자금",
  ">=",
  1000,
  "자금이 부족합니다.",
);
```

### ReqNationValue (퍼센트 지원)

```typescript
// 국고가 10000 이상
ConstraintHelper.ReqNationValue("gold", "국고", ">=", 10000);

// 군량이 최대치의 50% 이상
ConstraintHelper.ReqNationValue("rice", "군량", ">=", "50%");

// 민심이 80% 이상
ConstraintHelper.ReqNationValue("trust", "민심", ">=", "80%");
```

### ReqCityValue (퍼센트 지원)

```typescript
// 도시 농업 수치가 10000 이상
ConstraintHelper.ReqCityValue("agri", "농업", ">=", 10000);

// 도시 상업 수치가 최대치의 50% 이상
ConstraintHelper.ReqCityValue("comm", "상업", ">=", "50%");
```

## Constraint 인터페이스

모든 제약조건은 다음 인터페이스를 구현합니다:

```typescript
interface Constraint {
  name: string;
  requires(ctx: ConstraintContext): RequirementKey[];
  test(ctx: ConstraintContext, view: StateView): ConstraintResult;
}
```

### requires()

필요한 데이터를 선언합니다. 예:

```typescript
requires(ctx) {
  return [
    { kind: 'general', id: ctx.actorId },
    { kind: 'nation', id: ctx.nationId ?? 0 }
  ];
}
```

### test()

검증 로직을 수행하고 결과를 반환합니다:

- `{ kind: 'allow' }` - 통과
- `{ kind: 'deny', reason: string }` - 실패
- `{ kind: 'unknown', missing: RequirementKey[] }` - 데이터 부족

## 레거시 PHP와의 차이점

### 1. 타입 안전성

TypeScript의 타입 시스템을 활용하여 컴파일 타임에 오류를 감지합니다.

### 2. 명시적 의존성

`requires()` 메서드를 통해 필요한 데이터를 명시적으로 선언합니다.

### 3. 불변성

제약조건 인스턴스는 불변(immutable)으로 설계되어 있습니다.

### 4. 함수형 접근

상태 변경 대신 함수 호출로 결과를 반환합니다.

## 향후 마이그레이션 대상

아직 마이그레이션되지 않은 제약조건들:

- ReqGeneralCrewMargin
- ReqGeneralAtmosMargin
- ReqGeneralTrainMargin
- HasRoute / HasRouteWithEnemy
- NearNation
- BattleGroundCity
- AllowDiplomacy 관련 제약조건들
- 외교/전쟁 관련 제약조건들
- 기타 특수 제약조건들 (약 50개)

## 파일 구조

```
packages/logic/src/domain/constraints/
├── index.ts                           # 모든 제약조건 export
├── BeChiefConstraint.ts
├── NotChiefConstraint.ts
├── NotLordConstraint.ts
├── NeutralCityConstraint.ts
├── NotOccupiedCityConstraint.ts
├── NotNeutralDestCityConstraint.ts
├── OccupiedDestCityConstraint.ts
├── NotOccupiedDestCityConstraint.ts
├── SuppliedDestCityConstraint.ts
├── NotSameDestCityConstraint.ts
├── ReqNationGoldConstraint.ts
├── ReqNationRiceConstraint.ts
├── ExistsDestNationConstraint.ts
├── DifferentDestNationConstraint.ts
├── NotCapitalConstraint.ts
├── ReqGeneralValueConstraint.ts       # 범용
├── ReqNationValueConstraint.ts        # 범용
├── ReqCityValueConstraint.ts          # 범용
├── ReqDestCityValueConstraint.ts      # 범용
└── ReqDestNationValueConstraint.ts    # 범용
```
