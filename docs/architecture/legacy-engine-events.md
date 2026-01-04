# 레거시 이벤트 시스템

동적/정적 이벤트 처리 구조를 요약합니다. 이벤트는 우선순위 기반으로 처리되며, 월간/도시 점령 등 특정 타겟에 연결됩니다.

## 레거시 위치

- `legacy/hwe/sammo/Event/*`
- `legacy/hwe/sammo/StaticEvent/*`
- `legacy/hwe/sammo/StaticEventHandler.php`
- `legacy/hwe/sammo/TurnExecutionHelper::runEventHandler()`

## 이벤트 타겟

- `MONTH`
- `PRE_MONTH`
- `OCCUPY_CITY`
- `DESTROY_NATION`
- `UNITED`

## 처리 순서

- `event` 테이블에서 `target` 필터
- `priority` 내림차순, `id` 오름차순으로 실행
- `condition`과 `action` JSON으로 구성
- `EventHandler`가 조건을 평가하고 액션 실행

## 포팅 포인트

- 이벤트 순서와 우선순위를 보장
- 동적 이벤트는 DB 정의 기반으로 실행
- 정적 이벤트는 코드 기반 핸들러로 유지
- 이벤트 결과는 로그/히스토리에 기록
