# 구현 진행 보고서

## 요약
- `packages/logic`에 **Event System** 기초 구현 완료 (`EventRegistry`, `GameEvent`, `EventTarget`).
- `packages/logic`에 `DeltaUtil` 유틸리티 추가 (WorldDelta 병합 로직).
- `MonthlyPipeline`을 개선하여 `EventRegistry`를 주입받고 `PRE_MONTH` 및 `MONTH` 이벤트를 실행하도록 변경.
- `apps/engine`의 `EngineService`에 `EventRegistry`를 연동하고 `TestPreMonthEvent`를 등록하여 이벤트 시스템 동작 검증 준비 완료.
- `WorldSnapshot` 타입 불일치로 인한 `apps/engine` 빌드 에러 수정 (`diplomacy`, `troops`, `env` 초기화 추가).

## 실행한 명령
- `pnpm --filter @sammo-ts/logic build` (성공)
- `pnpm --filter @sammo-ts/engine build` (성공)

## 결과
- `packages/logic/src/domain/events/` 구조 생성 및 타입 정의.
- `packages/logic/src/utils/DeltaUtil.ts` 생성.
- `MonthlyPipeline.ts`가 이제 이벤트 시스템과 통합되어 레거시의 `EventTarget::PreMonth` -> `preUpdateMonthly` -> `EventTarget::Month` -> `postUpdateMonthly` 흐름을 지원함.
- `apps/engine`이 성공적으로 빌드됨.

## 비고
- `TestPreMonthEvent`는 이벤트 시스템 동작 확인을 위한 임시 이벤트임. 향후 실제 게임 로직 이벤트로 대체 필요.
- 다음 단계로 `legacy-engine-economy.md`에 명시된 월간 경제 로직(세율 조정, 유지비 등)이나 정적 이벤트를 추가 구현해야 함.