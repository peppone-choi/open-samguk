# 레거시 제약(Constraint) 시스템

커맨드 실행 전후 검증을 담당하는 제약 시스템을 요약합니다. 포팅 시 동일한 제약 계약을 유지해야 합니다.

## 레거시 위치

- `legacy/hwe/sammo/Constraint/*`
- `legacy/hwe/sammo/Constraint/Constraint.php`
- `legacy/hwe/sammo/Constraint/ConstraintHelper.php`

## 제약 구조

- 각 제약은 `Constraint` 추상 클래스를 상속
- `REQ_*` 플래그로 필요한 입력을 선언
- `test()`가 실패 시 `reason`을 설정

## 입력 맵

`Constraint::build()`는 다음 키를 입력으로 받습니다.

- `general`, `city`, `nation`
- `destGeneral`, `destCity`, `destNation`
- `cmd_arg`

`setEnv()`로 환경값을 주입합니다.

## 평가 흐름 (레거시)

- `Constraint::testAll()`이 제약 목록을 순차 평가
- 입력 타입은 `checkInputValues()`에서 검증
- 실패 시 `[constraintName, reason]` 반환
- `reason`이 비어 있으면 예외

## 포팅 포인트

- 제약 로직은 순수 함수로 분리
- 사전검사(API)와 실행검사(데몬)가 동일 계약 사용
- 상세 계약은 `docs/architecture/rewrite-constraints.md` 참고
