# 레거시 트리거 시스템

트리거는 전투/내정 단계에서 조건부 효과를 실행하는 체계입니다. 레거시는 우선순위 기반 트리거 호출자를 사용합니다.

## 레거시 위치

- `legacy/hwe/sammo/TriggerCaller.php`
- `legacy/hwe/sammo/GeneralTriggerCaller.php`
- `legacy/hwe/sammo/WarUnitTriggerCaller.php`
- `legacy/hwe/sammo/GeneralTrigger/*`
- `legacy/hwe/sammo/WarUnitTrigger/*`
- `legacy/hwe/sammo/ObjectTrigger.php`

## 우선순위 모델

`ObjectTrigger` 우선순위 상수:

- `PRIORITY_MIN`
- `PRIORITY_BEGIN`
- `PRIORITY_PRE`
- `PRIORITY_BODY`
- `PRIORITY_POST`
- `PRIORITY_FINAL`

낮을수록 우선순위가 높습니다.

## 실행 순서

- `TriggerCaller`는 우선순위별로 트리거 리스트를 유지
- `merge()`로 여러 트리거 리스트를 합산
- `fire()`가 우선순위 순서로 `action()` 실행

## 포팅 포인트

- 우선순위 순서 보장
- 결정론 RNG 적용
- 트리거 결과를 로그로 기록
