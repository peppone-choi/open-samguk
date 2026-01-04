# sammo-ts 세부 구현 프롬프트 (체크하면서 진행)

이 문서는 코딩 에이전트(또는 본인)가 **그대로 복사해서 실행**할 수 있도록, `docs/architecture/implementation-checklist.md`를 더 잘게 쪼갠 “세부 작업 프롬프트”입니다.

- 진행 방법: 각 소단계를 수행할 때마다 체크박스(`[ ]`)를 `[x]`로 바꾸세요.
- 원칙: 작은 수직 슬라이스로 끝내고(최소 기능), 반드시 **실제로 실행한 검증 명령**을 남기세요.

---

## 0) 작업 시작 프롬프트(이 블록을 에이전트에게 먼저 주기)

아래 지시를 최상위 지침으로 따른다.

1. 문서/코드 모두 “현재 워크스페이스”를 소스 오브 트루스로 취급한다.
2. 레거시(`legacy/`)는 참조/패리티 비교용이며 대규모 수정 금지.
3. 게임플레이 RNG는 `packages/common`의 `LiteHashDRBG`만 사용(결정론 필수).
4. 외부 입력은 zod로 검증(tRPC input 포함).
5. 도메인 로직은 `packages/logic`에 순수하게 유지(인프라 의존 금지).
6. 한 번에 한 단계만: 변경을 작게 유지하고, 각 단계마다 최소 1개 검증 명령 실행.
7. 새로 만든/수정한 파일 경로, 실행한 명령, 결과(성공/실패)를 짧게 보고한다.

---

## 1) 컨텍스트 수집(읽기 전용)

> 목적: “지금 레포가 실제로 어떤 상태인지”를 확인하고, 이후 단계에서 하드코딩/추측을 없앤다.

### 1.1 구조 확인

- [x] 워크스페이스 루트에서 디렉토리 목록 확인
  - 기대: `apps/`, `packages/`, `tools/`, `docs/`, `legacy/`
- [x] `docs/architecture/` 문서 목록 확인

### 1.2 핵심 문서 최신화 확인(수정 금지, 읽기만)

- [x] `AGENTS.md` 읽고 규칙 재확인
- [x] `docs/architecture/overview.md` 읽고 현재 스택이 NestJS/Next.js/tRPC인지 확인
- [x] `docs/architecture/runtime.md` 읽고 제어 계약(run/pause/resume/status) 및 Redis Streams 권장사항 확인
- [x] `docs/architecture/legacy-commands.md` 읽고 “가장 먼저 구현할 커맨드 후보 1~3개”를 메모
- [x] `docs/architecture/todo.md` 읽고 이미 계획된 항목/중복 작업 여부 확인

### 1.3 패키지/앱 스크립트 현실 확인

- [x] 루트 `package.json` 읽고 scripts가 placeholder인지 확인
- [x] `pnpm-workspace.yaml` 읽고 workspace 범위 확인
- [x] 각 패키지/앱 `package.json`의 `name`, `type`, `scripts` 확인
  - [x] `packages/common/package.json`
  - [x] `packages/infra/package.json`
  - [x] `packages/logic/package.json`
  - [x] `apps/api/package.json`
  - [x] `apps/engine/package.json`
  - [x] `apps/web/package.json`

---

## 2) Phase A — “기본 체력”을 아주 잘게 쪼개서 고정

> 목표: 최소한 `packages/common`까지는 build/test/typecheck가 반복 실행 가능.

### A0. 실행 가능한 명령부터 확정(실패하면 스크립트부터 고침)

- [x] `pnpm -r build` 실행
- [x] `pnpm -r test` 실행
- [x] `pnpm -r lint` 실행

**판정**

- [ ] 모두 성공 → A1로 진행
- [x] 실패 → 아래 A1/A2에서 실패 원인을 “스크립트/툴링”부터 해결

---

### A1. 루트 스크립트 정리(placeholder 제거)

- [x] 루트 `package.json` scripts 중 실제 동작하지 않는 placeholder 확인
- [x] `pnpm -r build`가 최소 `packages/common`을 빌드하도록 루트 스크립트 조정
- [x] `pnpm -r test`가 최소 `packages/common`을 테스트하도록 루트 스크립트 조정
- [ ] monorepo 타입체크 전략 결정(권장: 각 패키지 `typecheck` 제공)

**완료 조건**

- [x] `pnpm -r build`가 최소 common까지 성공

---

### A2. `packages/common` 빌드/배포 형태 고정

> 여기서 흔히 터지는 문제: ESM 출력 + export 경로(`.js`) + tsconfig moduleResolution.

- [x] `packages/common`의 빌드 도구 확인(tsup/tsdown/tsc)
- [x] 출력 형식(ESM/CJS) 확인 및 고정
- [x] `packages/common/src/index.ts` export가 빌드 결과와 일치하는지 확인
- [x] `JosaUtil`이 타입/빌드에서 에러가 없는지 확인(유니코드/대용량 상수 포함)

**스모크(권장)**

- [ ] node로 동적 import 테스트(패키지명은 실제 name으로 교체)

```zsh
node -e "import('@sammo/common').then(m=>console.log('common ok', Object.keys(m).length))"
```

**완료 조건**

- [ ] common build 성공
- [ ] common import 성공

---

## 3) Phase B — `packages/infra`를 “붙일 수 있게” 미세 단계로 만들기

> 목표: 엔진/로직에서 DB/Redis를 직접 잡지 않게, infra에 연결부를 둔다.

### B1. 인프라 의존성 선택(문서와 정합)

- [ ] ORM primary 결정: TypeORM 또는 Prisma 중 1개를 “우선”으로 확정
- [ ] Redis 클라이언트 결정(예: ioredis)
- [ ] env 검증 방식 결정(zod 권장)

**완료 조건**

- [ ] `packages/infra`가 제공할 최소 API 목록이 정해짐
  - 예: `createDbClient()`, `createRedisClient()`, `env` (검증된 env)

---

### B2. env 스키마 구현(먼저)

- [ ] `packages/infra/src/env.ts` 생성
- [ ] 아래 env 키를 최소로 포함(필요 시 추가)
  - [ ] `DATABASE_URL`
  - [ ] `REDIS_URL`
  - [ ] `PROFILE`
  - [ ] `GATEWAY_DB_SCHEMA`
  - [ ] `GATEWAY_DATABASE_URL`(선택)

**완료 조건**

- [ ] env 모듈 import 시 즉시 검증되고, 실패 시 의미있는 에러를 준다

---

### B3. DB/Redis 클라이언트 래퍼 구현

- [ ] `packages/infra/src/db/*`에 DB 클라이언트 생성
- [ ] `packages/infra/src/redis/*`에 Redis 클라이언트 생성
- [ ] 각 클라이언트는 “싱글턴/캐시” 정책을 명확히(테스트 고려)

**완료 조건**

- [ ] `pnpm --filter <infra> build` 성공
- [ ] 간단 스모크 테스트(모듈 로드) 존재

---

## 4) Phase C — `packages/logic`을 매우 작은 단위로 쌓기

> 목표: 순수 로직 + 결정론 테스트 1개부터.

### C1. 포트(interfaces) 정의

- [ ] `IClock`, `ILogger`, `IRepository` 같은 포트 정의
- [ ] RNG는 `packages/common`의 `RNG`를 직접 사용하거나 thin adapter 제공

**완료 조건**

- [ ] logic이 infra/nest/next에 의존하지 않음

---

### C2. MVP 도메인 타입/스냅샷/델타

- [ ] MVP 엔티티 타입 3~5개만 먼저 정의
  - [ ] `General`
  - [ ] `Nation`
  - [ ] `City`
  - [ ] `GameTime`
  - [ ] `TurnState`(선택)
- [ ] 스냅샷 입력 타입 정의
- [ ] delta 출력 타입 정의(변경 집합)
- [ ] stable ordering/normalize 유틸 정의(테스트 흔들림 방지)

**완료 조건**

- [ ] `snapshot -> execute -> delta` 형태의 순수 함수/클래스 1개 완성

---

### C3. 결정론 유닛 테스트 1개 만들기(가장 중요)

- [ ] Vitest/Jest 중 실제 레포에서 쓰는 것으로 통일
- [ ] `LiteHashDRBG`로 고정 시드를 써서 결과가 매번 동일함을 확인
- [ ] 테스트는 출력 정규화 후 비교

**완료 조건**

- [ ] 동일 실행에서 항상 동일 결과

---

## 5) Phase D — `apps/engine` 턴 데몬 MVP를 “아주 작은 수직 슬라이스”로

> 목표: status/run/pause/resume만 되는 데몬.

### D1. 최소 상태 머신

- [ ] `TurnDaemonStatus` 정의(idle/running/paused/error 등)
- [ ] 상태 전이 규칙 정의(문서와 정합)
- [ ] 로그에 상태 전이를 남김

**완료 조건**

- [ ] 실행하면 idle
- [ ] run하면 running으로 갔다가 완료 후 idle(또는 tick 기반이면 running 유지)
- [ ] pause/resume 작동

---

### D2. 엔진 내부 큐(초기에는 in-process)

- [ ] `DaemonCommand` 타입 정의(run/pause/resume/getStatus)
- [ ] command 처리 루프 구현(단순 queue)

**완료 조건**

- [ ] command를 넣으면 처리되고 결과가 반환됨

---

## 6) Phase E — `apps/api` NestJS + tRPC MVP

### E1. 최소 tRPC 라우터

- [ ] `status.get`
- [ ] `daemon.run`
- [ ] `daemon.pause`
- [ ] `daemon.resume`

**완료 조건**

- [ ] tRPC 호출로 엔진 상태가 실제 변경

---

### E2. Engine 연결을 교체 가능한 구조로

- [ ] `IDaemonClient` 같은 인터페이스 도입
- [ ] 구현체 2개를 목표로 설계
  - [ ] in-process(즉시 동작)
  - [ ] redis-stream(스켈레톤/후속)

**완료 조건**

- [ ] API 라우터는 인터페이스만 의존

---

## 7) Phase F — `apps/web` Next.js 최소 화면

### F1. “상태 + 버튼”만

- [ ] tRPC client 연결
- [ ] 상태 표시
- [ ] run/pause/resume 버튼

**완료 조건**

- [ ] 웹 버튼 → API → 엔진 상태 변경(E2E)

---

## 8) Phase G — Redis Streams로 제어 채널 전환(목표 구조)

### G1. 스트림 키/프로필 네임스페이스

- [ ] 키 규칙 결정: `stream:{profileName}:daemon:commands` 등
- [ ] consumer group 사용

### G2. 멱등성(requestId)

- [ ] `requestId`를 커맨드에 필수로 포함
- [ ] 엔진에서 중복 처리 방지(저장소/캐시/Redis SET 등)

### G3. 실패/데드레터(최소)

- [ ] 실패 시 재시도 횟수/처리 규칙 결정
- [ ] 데드레터 스트림(또는 리스트)로 이동

**완료 조건**

- [ ] API→Stream 기록
- [ ] Engine→Stream 소비
- [ ] 동일 requestId 중복 실행 방지 테스트 통과

---

## 9) Phase H — 스냅샷/저널 최소

- [ ] 저널 포맷 정의(입력+시드+delta)
- [ ] 재시작 시 스냅샷 로드 + 저널 재생

**완료 조건**

- [ ] 재시작해도 동일 상태 재현

---

## 10) Phase I — 패리티 테스트 하네스(최우선)

### I1. 입력/출력 포맷 고정

- [ ] 입력: 스냅샷/시드/시간/시나리오/커맨드
- [ ] 출력: delta/주요 수치/로그 요약
- [ ] normalize 규칙 문서화

### I2. 최소 케이스 1개부터

- [ ] RNG/조사/가중치 선택 등 공통 유틸 비교 테스트
- [ ] (가능하면) 레거시 실행 결과와 비교

**완료 조건**

- [ ] 테스트 1개가 안정적으로 통과

---

## 11) 매 단계 보고 템플릿(붙여넣기)

작업 후 아래 형식으로 짧게 보고한다.

- What changed: (파일 경로 목록)
- How to verify: (실행한 명령)
- Result: (성공/실패, 실패면 다음 조치)
