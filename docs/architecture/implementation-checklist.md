# sammo-ts 구현 실행 체크리스트 (NestJS + Next.js + tRPC)

이 문서는 이 레포에서 **차례대로 구현**하기 위한 “실행용” 체크리스트입니다.

- 더 잘게 쪼갠 작업 프롬프트: `docs/architecture/implementation-prompt.md`

- 체크박스(`[ ]`)를 직접 `[x]`로 바꾸며 진행합니다.
- 각 단계는 **작은 수직 슬라이스**로 끝내고, 반드시 최소 1개의 검증 명령을 실행합니다.
- 레거시(`legacy/`)는 “동작/결과 비교의 기준”이며, 대규모 수정은 하지 않습니다.

---

## 0. 진행 규칙 (필수)

### 0.1 기본 원칙

- [x] 결정론 RNG 정책 준수: 게임플레이 난수는 `packages/common`의 `LiteHashDRBG` 기반만 사용한다.
- [x] 외부 입력(HTTP/tRPC/CLI/JSON)은 무조건 검증한다(zod 권장).
- [x] 도메인 로직은 인프라/프레임워크에 의존하지 않는다(`packages/logic` 순수 유지).
- [x] 변경은 작게: 한 번에 한 단계(또는 한 기능)만.
- [x] “문서와 구현이 불일치”하면 구현에 맞춰 문서를 갱신한다(특히 `docs/architecture/*`).

### 0.2 산출물/검증 원칙

각 단계 완료 시 아래를 모두 만족해야 합니다.

- [x] 산출물: 실제 코드/스크립트/문서가 존재한다.
- [x] 검증: 최소 1개(가능하면 build + typecheck + test) 명령을 실제로 실행했다.
- [x] 회귀 방지: 최소 1개 테스트/스모크가 존재한다(없으면 추가).

### 0.3 경로/문서 기준

- [x] 리라이트 구조: `apps/*`, `packages/*`, `tools/*` (pnpm workspace)
- [x] 문서 기준: `docs/architecture/overview.md`, `docs/architecture/runtime.md`, `docs/testing-policy.md`
- [x] 레거시 엔진 지도: `docs/architecture/legacy-engine.md` 및 `docs/architecture/legacy-engine-*.md`

---

## 1. 시작 전 점검(Pre-flight)

### 1.1 워크스페이스 상태 확인

- [x] `AGENTS.md` 읽고 규칙 재확인
- [x] `docs/architecture/overview.md` 현재 스택(NestJS/Next.js/tRPC) 확인
- [x] `docs/architecture/runtime.md`의 데몬 제어 계약/스트림 정책 확인
- [x] `docs/architecture/legacy-commands.md` 최신 내용 확인(가장 먼저 구현할 커맨드 후보 선별용)
- [x] `docs/architecture/todo.md` 최신 내용 확인(중복 작업 방지)

### 1.2 공통 유틸 빌드 가능성 확인

- [x] `packages/common`에 RNG 유틸 존재 확인 (`RNG`, `LiteHashDRBG`, `RandUtil`, `TestRNG`)
- [x] `packages/common`에 `JosaUtil` 존재 확인
- [x] `packages/common/src/index.ts`가 위 항목들을 export 하는지 확인

### 1.3 즉시 실행 가능한 검증 명령(실행하고 체크)

> 아래 명령은 레포 스크립트 구성에 따라 조정될 수 있습니다. 실제로 통과하는 커맨드로 고정하고, 실패하면 Phase A에서 스크립트부터 정리합니다.

- [x] `pnpm -r build` 실행해본다
- [x] `pnpm -r test` 실행해본다
- [x] `pnpm -r lint` 실행해본다

---

## 2. Phase A — 모노레포 “기본 체력” 고정 (빌드/타입/테스트)

### A1. 루트 스크립트/워크스페이스 스크립트 정리

**목표**: 최소한 `packages/common`까지는 `build/test`가 “항상” 돌아가게 만든다.

- [x] 루트 `package.json`의 스크립트가 placeholder인지 확인
- [x] placeholder라면 실제 동작하도록 수정
- [x] `pnpm-workspace.yaml`에 `apps/*`, `packages/*` 포함 확인
- [x] TypeScript 기준(`tsconfig.base.json`)을 각 패키지/앱에 적용

**완료 조건**

- [x] `pnpm -r build`가 최소 `packages/common`까지 성공
- [x] 타입 에러가 없다(수정한 범위 기준)

**검증**

- [x] `pnpm -r build`

---

### A2. `packages/common`을 확실히 빌드 가능하게

**목표**: 앞으로 모든 패키지들이 의존할 “결정론 유틸”을 안정화.

- [x] `packages/common/package.json`의 `build` 스크립트 확인
- [x] 출력 포맷(ESM/CJS) 정책 확인
- [x] export 경로 일관성 확인(예: `.js` 확장자 포함 여부)
- [x] `JosaUtil`이 빌드/타입체크에 걸리지 않는지 확인
- [x] 최소 스모크 테스트 추가(필요 시)

**완료 조건**

- [x] `pnpm --filter <common패키지명> build` 성공
- [x] (선택) Node에서 동적 import로 모듈 로드가 성공

**검증(예시)**

- [x] `pnpm --filter @sammo-ts/common build`
- [x] `node -e "import('@sammo/common').then(m=>console.log('ok', Object.keys(m).length))"`

---

## 3. Phase B — `packages/infra` (DB/Redis/Env) 골격

### B1. 인프라 패키지 기본 API 설계

**목표**: 도메인/엔진이 DB/Redis에 직접 접근하지 않도록 “연결부”를 고정.

- [x] DB 접근 방식 1개를 primary로 확정(TypeORM 또는 Prisma)
- [x] Redis 클라이언트 도입(예: ioredis) 및 최소 래퍼 제공
- [x] 환경변수 스키마(zod)로 검증: `DATABASE_URL`, `REDIS_URL`, `PROFILE`, `GATEWAY_DB_SCHEMA` 등

**완료 조건**

- [x] `createDbClient()`, `createRedisClient()` 같은 최소 API 제공
- [x] 빌드/테스트 시 모듈 로드가 성공

**검증**

- [x] `pnpm --filter <infra패키지명> build`

---

### B2. Gateway schema vs Game schema 분리 정책 반영

**목표**: `docs/architecture/runtime.md`의 스키마 분리 규칙을 코드 레벨로 반영.

- [x] gateway DB schema(`GATEWAY_DB_SCHEMA`)와 profile game schema(`PROFILE`) 분리
- [x] 커넥션 또는 schema prefix 전략 하나로 고정
- [x] 마이그레이션 실행 스크립트 제공(초기엔 더미여도 CLI는 존재)

**완료 조건**

- [x] `db:migrate` 같은 스크립트가 존재하고 실행 가능한 형태
- [x] 코드에서 스키마가 하드코딩되어 있지 않음

---

## 4. Phase C — `packages/logic` (순수 도메인 로직) MVP

### C1. 외부 의존성 포트(Port) 정의

- [x] 시간: `IClock` (now, monotonic 등)
- [x] RNG: `RNG` (common의 인터페이스를 그대로 사용하거나 thin adapter)
- [x] 로그: `ILogger`
- [x] 저장소: `IRepository` (초기엔 in-memory 구현체 가능)
- [x] 플러시: `IFlushHook` 정의
- [x] 턴 관리: `ITurnRepository` 정의
- [x] 데몬 제어: `IDaemonClient` 정의
- [x] 스냅샷: `ISnapshotRepository` 정의

**완료 조건**

- [x] `packages/logic`는 프레임워크(Nest/Next/DB)에 직접 의존하지 않음
- [x] 최소 1개 유닛 테스트가 결정론적으로 통과

---

### C2. MVP 엔티티/스냅샷/델타 정의

**목표**: “스냅샷 입력 → 로직 실행 → delta 출력”을 가능한 빨리 만든다.

- [x] MVP 엔티티 선정: `General`, `Nation`, `City`, `GameTime`, `TurnState` 등
- [x] Snapshot 타입과 Delta 타입 정의
- [x] WorldState 도메인 모델 구현
- [x] 출력 정규화(정렬 규칙) 유틸 정의(테스트 안정화)

**완료 조건**

- [x] 스냅샷 기반 실행이 가능
- [x] 결과가 stable ordering을 가진다

---

## 5. Phase D — `apps/engine` (턴 데몬) 최소 동작

### D1. 턴 데몬 상태 머신 + 제어 계약

**목표**: 최소한 아래가 동작하는 단일 프로세스 엔진.

- [x] 상태 타입: `TurnDaemonStatus` (idle/running/paused/error 등)
- [x] 명령 타입: `run/pause/resume/getStatus`
- [x] 이유 타입: `RunReason = schedule | manual | poke`

**완료 조건**

- [x] 엔진을 실행하면 상태가 바뀌고 로그가 남는다
- [x] pause/resume이 실제로 동작한다(최소 CLI/임시 API)

---

### D2. In-memory world + flush hook 골격

- [x] `InMemoryWorld` 또는 유사 구조로 메모리 권위 상태 보유
- [x] flush hook 인터페이스 정의(초기엔 no-op)
- [x] RNG 시드 구성 규칙을 코드화(숨은 서버 시드 + 컨텍스트)

**완료 조건**

- [x] 동일 입력+동일 시드 → 동일 결과 재현 스모크 테스트 존재

---

## 6. Phase E — `apps/api` (NestJS + tRPC) 최소 수직 슬라이스

### E1. tRPC 라우터 구성(최소)

- [x] `status.get`: 데몬 상태 조회
- [x] `daemon.run`: 수동 실행
- [x] `daemon.pause`: 일시정지
- [x] `daemon.resume`: 재개

**완료 조건**

- [x] API 실행 후 tRPC 호출로 상태 변경이 된다

---

### E2. Engine 연결 2단계 전략 구현

**Phase 1 (MVP)**

- [x] API가 엔진 모듈을 직접 import해서 같은 프로세스에서 호출

**Phase 2 (목표)**

- [x] Redis Streams 기반 `IDaemonClient` 구현체로 교체 가능하도록 인터페이스 분리

**완료 조건**

- [x] API 코드가 엔진 구현체에 강결합되지 않음

---

## 7. Phase F — `apps/web` (Next.js) 최소 화면 + tRPC client

### F1. 최소 화면(“상태 + 버튼”)만

- [x] `status.get` 표시
- [x] run/pause/resume 버튼
- [x] 과한 UX 금지(필수 기능 외 추가 페이지/모달/디자인 확장 금지)

**완료 조건**

- [x] 웹 버튼 → API → 엔진 상태 변경 E2E 확인

---

## 8. Phase G — Redis Streams 제어 채널 도입(목표 구조)

### G1. Streams 키/멱등성/데드레터 최소

- [x] 키 네임스페이스(프로필 포함): `stream:{profileName}:daemon:commands` 등
- [x] `requestId` 기반 중복 처리 방지
- [x] 실패 재시도/데드레터 스트림(초기엔 단순)

**완료 조건**

- [x] API가 stream에 커맨드를 기록
- [x] 엔진이 consumer group으로 소비
- [x] 같은 `requestId` 재전송 시 중복 실행 없음

---

## 9. Phase H — 스냅샷/저널(영속화) 최소 루프

### H1. 저널 기록(최소)

- [x] (입력 스냅샷 + 시드 + 실행 결과 delta) 기록 구조 정의
- [x] 재시작 시 (스냅샷 로드 → 저널 재생) 골격

**완료 조건**

- [x] 동일 스냅샷/저널로 재시작하면 동일 상태 재현

---

## 10. Phase I — 레거시 패리티 테스트 하네스(최우선)

### I1. 패리티 입력/출력 포맷 고정

- [x] 입력: 엔티티 스냅샷, 시드, 게임 시간, 시나리오, 커맨드
- [x] 출력: delta, 로그 요약, 주요 수치
- [x] 정규화/정렬 규칙 명시

**완료 조건**

- [x] Vitest로 최소 1개 케이스가 안정적으로 통과

---

### I2. 레거시 비교 전략

- [x] 가능: 레거시 실행 결과를 참조(스모크 비교)
- [x] 불가: 문서/수식 기반으로 기대 결과를 고정하고 점진적으로 확대

**완료 조건**

- [x] RNG/조사/가중치 선택 같은 공통 유틸부터 비교 테스트 보유

---

## 11. Phase J — 커맨드/제약/트리거 시스템 MVP

> 기준 문서: `docs/architecture/legacy-commands.md`, `docs/architecture/legacy-engine-triggers.md`

### J1. 커맨드 1~3개 수직 구현

- [x] 커맨드 타입 정의
- [x] API 레벨 입력 검증(zod)
- [x] 도메인 제약(Constraint) 사전검증(엔진/로직)
- [x] 실행은 엔진에서만(메모리 권위)

**완료 조건**

- [x] 예약/실행/저널/결과 반영이 E2E로 동작

---

### J2. 트리거 attempt/execute 2단계 골격

- [x] 트리거 registry + 우선순위
- [x] attempt/execute 분리
- [x] RNG 시드 컨텍스트 포함

**완료 조건**

- [x] 트리거 1~2개라도 결정론적으로 재현

---

## 12. Phase K — 관측/운영 최소

- [x] 상태/헬스 체크
- [x] 로그에 `requestId/seed/turnTime` 포함
- [ ] (선택) 턴 실행 시간/큐 길이 같은 최소 메트릭

**완료 조건**

- [x] 장애 조사에 필요한 최소 로그 확보

---

## 13. 작업 루프(매 PR/매 기능 단위로 체크)

- [x] 변경 범위(파일 목록)와 목적을 2줄로 정리
- [x] 문서(`docs/architecture/*`)와 구현 불일치 여부 확인
- [x] 테스트 또는 스모크 1개 이상 추가/갱신
- [x] `pnpm -r build` 또는 변경 패키지 `build` 실행
- [x] `pnpm -r test` 또는 변경 패키지 `test` 실행
- [x] 결과 요약: What changed / How to verify / Result