# 구현 진행 보고서

## 요약
- `packages/logic`의 `MonthlyPipeline`에 **Monthly Economy Logic** 구현 완료.
  - `preUpdateMonthly`: 장수/국가/도시 상태 갱신 (제한, 세율, 도시 상태, 첩보, 개발비).
  - `postUpdateMonthly`: 외교 상태 갱신 (기한, 상태 전이), 전선(Front) 설정(placeholder).
- `packages/logic/src/domain/entities.ts`에 누락된 필드 추가 (`makeLimit`, `rate`, `rateTmp`, `surrenderLimit`, `front`).
- `packages/logic/src/utils/DeltaUtil.ts`에 `diplomacy`, `env` 병합 로직 추가.
- `GameConst`에 전쟁 설정 관련 상수 추가.
- `Event System` (이전 단계 완료)과 함께 월간 처리 파이프라인의 핵심 로직이 대부분 포팅됨.

## 실행한 명령
- `pnpm --filter @sammo-ts/logic build` (성공)
- `pnpm --filter @sammo-ts/engine build` (성공)

## 결과
- `MonthlyPipeline.ts`가 레거시 `preUpdateMonthly` 및 `postUpdateMonthly`의 주요 로직을 포함하게 됨.
- `entities.ts`가 레거시 데이터 구조를 더 정확하게 반영함.

## 비고
- `Front` 라인 설정 로직(`SetNationFront`)은 `MapData`와 `City.path` 정보가 필요하여 현재는 주석 처리됨. 향후 `MapData` 구현 시 완성 필요.
- 외교 상태 변경 시 메타데이터(`dead` 등) 처리와 로그 기록은 MVP 수준으로 구현됨. 상세 로직 보강 필요.
