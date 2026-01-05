# 구현 진행 보고서

## 요약
- `packages/logic`에 **지도 데이터 및 유틸리티** 구현 완료 (`MapUtil.ts`).
  - 레거시 `CityConstBase.php`의 도시 목록, 좌표, 연결 데이터(Path) 포팅 완료.
  - `MapUtil.getConnections`, `MapUtil.areAdjacent` 등 지형 관련 유틸리티 제공.
- `MonthlyPipeline.ts`의 **전선 설정(SetNationFront)** 로직 완성.
  - `MapUtil`을 사용하여 인접 국가(적국, 선포국, 공백지)에 따른 도시 전선 상태(`front`) 계산 로직 이관.
- `packages/logic` 및 `apps/engine` 빌드 성공 (TypeScript 타입 안정성 확보).

## 실행한 명령
- `pnpm --filter @sammo-ts/logic build` (성공)
- `pnpm --filter @sammo-ts/engine build` (성공)

## 결과
- `MapUtil.ts`를 통해 게임 로직 내에서 도시 간의 연결 관계를 파악할 수 있게 됨.
- 월간 정산 시 각 국가의 전선 상태가 레거시 규칙(0:후방, 1:준전선, 2:공백인접, 3:전선)에 따라 자동 갱신됨.
- `ConstraintHelper.ts` 및 `GeneralMoveCommand.ts` 등 지도 데이터가 필요한 기존 코드들의 빌드 에러 해결.

## 비고
- 현재 `MapUtil`은 정적 데이터를 내장하고 있음. 시나리오별 지도 변경 대응이 필요할 경우 데이터 로딩 방식으로 개선 가능.
- 다음 단계로 이동/출병 등 지도 데이터를 활용하는 핵심 커맨드들의 정합성을 검증할 수 있음.