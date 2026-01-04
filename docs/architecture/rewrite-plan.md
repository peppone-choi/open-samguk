# TypeScript Rewrite Plan (sammo-ts)

The rewrite targets a pnpm workspace-based monorepo with NestJS services and Next.js frontends.

## Planned Layout

- `/packages/common`: shared utilities and type definitions (RNG/bytes/테스트 RNG 포함, no infra)
- `/packages/infra`: TypeORM/Prisma/Redis connectors and other runtime infra
- `/packages/logic`: pure game logic with DI and interfaces
- `/apps/api`: NestJS backend (Game & Gateway API)
- `/apps/engine`: Turn daemon (Node.js/NestJS)
- `/apps/web`: Next.js frontend (Gateway & Game UI)
- `/tools/build-scripts`: build and deployment scripts

## Current Implementation Notes

- `packages/common`: RNG, RandUtil, JosaUtil 등 핵심 유틸리티 포팅 완료.
- `docs/architecture`: 전체 아키텍처 및 도메인 로직 문서화 완료.
- `apps/`, `packages/` 스캐폴딩 생성됨.

## Runtime Stack (Planned)

- Backend: Node.js + NestJS
- API: tRPC + zod (Primary)
- ORM: TypeORM (Primary) or Prisma
- Frontend: Next.js (React), TailwindCSS, shadcn/ui
- Data: PostgreSQL, Redis sessions
- Testing: Vitest / Jest

## Frontend Direction

- Next.js 기반의 통합 또는 분리된 SPA/SSR 구조.
- UI visuals should stay close to the legacy look, but layout changes are allowed as long as required information is preserved.
- shadcn/ui와 TailwindCSS를 사용하여 현대적인 UI 구축.
- Prefer client-driven rendering: fetch most data via API and let the client own data shaping and presentation unless the data must be hidden.

## Constraint Evaluation Contract

The shared constraint contract (daemon vs API precheck split) is documented in `docs/architecture/rewrite-constraints.md`.

## Legacy Data Migration

- Legacy data is for migration only; the rewrite runtime does not depend on it.
- Once DB migration is complete, legacy data can be retired.

## Profiles (Planned)

- Profiles are server+scenario pairs; scenario selection is required for build/runtime.
- Server IDs: `che`, `kwe`, `pwe`, `twe`, `nya`, `pya`

## Phase 0 - 분석 및 매핑

- 레거시 엔티티/커맨드 목록화
- 상호작용 흐름 문서화
- 마이그레이션 전략 초안
- 결정론 RNG 재현 계획

## Phase 1 - 기반 구조

- pnpm 워크스페이스 구성
- `packages/common`, `packages/infra`, `packages/logic` 스캐폴딩
- `app/game-api`, `app/game-engine` 스캐폴딩
- Prisma 기반 DB 연결/엔티티 설계 착수
- 인증/세션 흐름 (Gateway 연동)
- Postgres 영속 스키마 구성
- 관측/로깅 기본 구조

## Phase 2 - 메모리 상태 + 영속화

- In-Memory State Manager 구현
- 스냅샷/저널 설계 및 적재/저장 흐름
- 커맨드/쿼리 분리 인터페이스 정의
- 데몬/API 통신 채널 확정

## Phase 3 - 핵심 게임 루프

- `general`, `nation`, `city`, `troop` 모듈
- 턴 예약/처리 파이프라인
- 이벤트/기록 시스템
- AI 자동 행동

## Phase 4 - 실시간 및 커뮤니케이션

- 메시지/게시판
- WebSocket/SSE 채널 구축
- 실시간 피드 이벤트 정의

## Phase 5 - 외교/경제/투표

- 외교/경매/투표 시스템
- 랭킹/통계 산출

## Phase 6 - 마이그레이션 및 론칭

- 레거시 데이터 이관
- 정합성 검증 및 롤백 계획
- 운영 도구/모니터링 구축

## 위험 요소

- 메모리 상태와 영속화 지연 간 일관성
- 턴 처리 락 및 재시작 복구 전략
- 실시간 스트림 순서 보장
