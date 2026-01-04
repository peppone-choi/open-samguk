# 아키텍처 개요

이 문서는 포팅 아키텍처의 전체 구조와 핵심 결정을 요약합니다. 구현자는 이 문서를 출발점으로 각 하위 문서를 따라가며 세부 설계를 구현합니다.

## 목표

- 레거시 행동의 재현성과 결과 일치
- Verifiable RNG (LiteHashDRBG)로 동일 입력 -> 동일 결과 보장
- 변형 CQRS: 커맨드/쿼리 분리 + 메모리 상태 권위
- Postgres 기반 영속성 (스냅샷/저널)
- 프로필(서버+시나리오) 기반 빌드 및 실행 환경 분리
- pnpm 워크스페이스 기반 모노레포 구조 (`packages/*`, `app/*`)
- WebSocket + SSE로 실시간 UX 제공

## 프로젝트 명칭

- 공식 명칭: 삼국지 모의전투 HiDCHe
- 통칭: 삼모, 삼모전, 힏체섭
- 코드/문서 약칭: sammo, hidche
- TypeScript 리라이트 작업명: sammo-ts

## 레이어 구조

- 레거시 런타임: `legacy/` 및 `legacy/hwe/` 하위의 PHP 엔트리 포인트
- 레거시 엔진 코어: `legacy/hwe/sammo/` 하위의 도메인 로직
- 레거시 프론트엔드: `legacy/hwe/ts/` 하위의 Vue/TypeScript
- 리라이트: `packages/` 및 `apps/` 하위의 pnpm 워크스페이스 모노레포

## 핵심 결정

- 소스 오브 트루스는 백엔드 메모리 상태
- DB는 영속성 보장만 담당 (스냅샷/저널)
- 시작 시 DB에서 적재, 종료 시 메모리 상태 저장
- 모든 난수 생성은 `LiteHashDRBG`를 통해 결정론적으로 수행
- 커맨드와 쿼리를 분리하되 동일한 메모리 상태를 참조
- Redis Streams를 통한 데몬 제어 및 뮤테이션 요청 처리

## 프로세스 레이어

- `apps/api` (NestJS): 인증/검증, 커맨드 수신, 쿼리 제공(tRPC), WS/SSE 브로드캐스트 (Game API)
- `apps/engine` (Node.js/NestJS): 턴 처리, 이벤트 실행, 메모리 상태 소유 (Turn Daemon)
- `apps/web` (Next.js): 게임 및 게이트웨이 프론트엔드 (Tailwind + shadcn/ui)
- `packages/common`: 공유 유틸리티 및 타입 정의 (RNG 등)
- `packages/infra`: TypeORM/Prisma/Redis 커넥터 등 인프라 레이어
- `packages/logic`: 순수 게임 로직 (DI/인터페이스 기반)
- `postgres`: 영속 저장

## 상태/데이터 흐름

- 부팅: 스냅샷 로드 -> 저널 재생 -> 인덱스 구축
- 운영: 커맨드 -> Redis Stream -> 메모리 적용 -> 저널 기록 -> 이벤트 브로드캐스트
- 종료: 요청 차단 -> 큐 플러시 -> 스냅샷 저장

## 실시간 채널 정책

- WebSocket: 개인/국가 채널, 커맨드 즉시 결과
- SSE: 전역 이벤트, 턴 틱, 히스토리 스트림

## 횡단 정책 (Cross-Cutting Policies)

- 게임플레이에 임의의 난수 사용 금지; 결정론적 RNG(`LiteHashDRBG`) 필수 사용
- 외부 JSON/데이터 입력은 `zod`로 검증; 스키마 명칭은 `z` 접두사 사용 (예: `zUser`)
- 도메인 로직은 엔드포인트나 UI와 독립적으로 유지
- 핵심 게임플레이 로직에는 유지보수자를 위해 명확한 한글 주석 권장
- 테스트 전략 및 레이어링: `docs/testing-policy.md` 참조

## 문서 맵

핵심:

- 개요: `docs/architecture/overview.md`
- 런타임: `docs/architecture/runtime.md`
- 턴 데몬 수명주기: `docs/architecture/turn-daemon-lifecycle.md`
- 영속성 스키마: `docs/architecture/persistence-schema.md`
- API 계약: `docs/architecture/api-contract.md`
- REST API: `docs/architecture/rest-api.md`
- Gateway 스키마: `docs/architecture/gateway-schema.md`
- 마이그레이션: `docs/architecture/migrations.md`
- 테스트 정책: `docs/testing-policy.md`

레거시 분석:

- 레거시 엔진 맵: `docs/architecture/legacy-engine.md`
- 레거시 엔티티: `docs/architecture/legacy-entities.md`
- 레거시 커맨드: `docs/architecture/legacy-commands.md`
- 레거시 API: `docs/architecture/legacy-api.md`
- 레거시 시나리오: `docs/architecture/legacy-scenarios.md`
- 레거시 AI: `docs/architecture/legacy-engine-ai.md`
- 레거시 턴 실행: `docs/architecture/legacy-engine-execution.md`
- 레거시 전투: `docs/architecture/legacy-engine-war.md`
- 레거시 외교/메시지: `docs/architecture/legacy-engine-diplomacy.md`
- 레거시 경제: `docs/architecture/legacy-engine-economy.md`
- 레거시 이벤트: `docs/architecture/legacy-engine-events.md`
- 레거시 아이템/특기: `docs/architecture/legacy-engine-items.md`
- 레거시 트리거: `docs/architecture/legacy-engine-triggers.md`
- 레거시 제약: `docs/architecture/legacy-engine-constraints.md`
- 레거시 도시: `docs/architecture/legacy-engine-city.md`
- 레거시 상수/규칙: `docs/architecture/legacy-engine-constants.md`
- 레거시 로깅: `docs/architecture/legacy-engine-logging.md`
- 레거시 풀/선택: `docs/architecture/legacy-engine-pools.md`
- 레거시 서버 환경: `docs/architecture/legacy-engine-server-env.md`
- 레거시 유산 포인트: `docs/architecture/legacy-inherit-points.md`

설계/계약:

- 포팅 계획: `docs/architecture/rewrite-plan.md`
- 제약 계약: `docs/architecture/rewrite-constraints.md`
- Postgres 스키마: `docs/architecture/postgres-schema.md`
- 엔티티 상호작용: `docs/architecture/entity-interactions.md`
- TODO: `docs/architecture/todo.md`
