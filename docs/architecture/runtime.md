# Runtime and Build Profiles

Build outputs should be emitted to `/dist/{profileName}` per profile to keep deployments predictable. Profiles are server+scenario pairs, and scenario selection is required because it drives unit sets and DB settings.

## Database Schemas (Gateway vs Game)

Gateway uses a shared schema (default `public`) for login/profile state, while each game profile runs against its own schema. This keeps gateway data stable and allows profile-scoped game data resets.

- Gateway schema: `GATEWAY_DB_SCHEMA` (default `public`)
- Game schema: `PROFILE` value (e.g., `hwe`, `che`)
- Optional override for gateway DB URL: `GATEWAY_DATABASE_URL`

## Suggested Build Pattern

- Wrapper script under `tools/build-scripts`
- `pnpm build:server --profile che --scenario default`
- CI-friendly: `PROFILE=che SCENARIO=default pnpm build:server`
- Build tooling: use `tsdown` for backend/libs, and Vite for frontend apps.

## Deterministic RNG Policy

- Gameplay randomness must be reproducible from a deterministic seed
- Prefer `legacy/hwe/ts/util/LiteHashDRBG.ts` and `legacy/hwe/ts/util/RNG.ts`
- Seed composition should include hidden base seed plus action context

## Gateway Orchestration (Single Host Draft)

Gateway API is the single source of truth for profile state and reconciles PM2-managed processes on boot and on a short interval. The orchestrator runs as a separate process (`GATEWAY_ROLE=orchestrator`). The DB owns the desired state; PM2 is treated as the actuator. The runtime state is grouped so that `game-api` + `turn-daemon` are either on together or off together.

### DB-Owned Profile State

Profiles are tracked by `profileName` (= `${profile}:${scenario}`). Gateway loads the profile table on boot, then reconciles PM2 to match.

- `예약됨` (RESERVED): preopen/open timestamps are set; processes off.
- `가오픈` (PREOPEN): build done; API+daemon on, daemon paused.
- `가동중` (RUNNING): both `game-api` and `turn-daemon` should be on.
- `정지됨` (STOPPED): processes off; may be resumed later.
- `정지(오류)` (PAUSED): fatal error; daemon paused but process remains on.
- `천하통일` (COMPLETED): game finished; API on, daemon paused.
- `비활성화` (DISABLED): excluded from orchestration; start forbidden.

## Redis Communication Recommendation (Draft)

Use Redis Streams for daemon control and mutation requests, and Redis pub/sub for transient fan-out events. Streams provide durability, backpressure, and replay while pub/sub keeps live updates simple and low-latency.

### Recommended Split

- Redis Streams:
  - API server -> daemon: mutation requests, turn-run commands.
  - Daemon -> API server: run status events, job results, error reports.
  - Use consumer groups for daemon workers and API server listeners.
  - Require `requestId` for correlation and idempotency.
  - Ack on success; move failed items to a dead-letter stream after retry.
- Redis pub/sub:
  - Daemon -> API server: low-stakes live update signals (run started/ended).
  - API server -> frontend: SSE fan-out triggered by pub/sub updates.
  - Do not use pub/sub for data that must be replayed or audited.

### 운영 참고 사항 (Operational Notes)

- 스트림 키는 서버+시나리오 프로필별로 네임스페이스를 분리해야 함.
- `MAXLEN`을 사용하여 스트림 길이를 제한하고 저장 공간을 캡핑함.
- API 서버는 `requestId`를 통해 중복 처리를 방지해야 함.
- 데몬이 바쁠 때 API는 새로운 뮤테이션을 스트림에 큐잉하고 클라이언트에게 수락됨(accepted) 상태를 반환함.

상세한 생명주기 및 제어 흐름은 `docs/architecture/turn-daemon-lifecycle.md`에 정의되어 있음.

## 인증 및 세션 관리 (Authentication and Session Management - Draft)

로그인은 카카오 OAuth를 주 인증 수단으로 사용함. 이는 한국 실명 인증을 활용하고 다중 계정 남용을 방지하는 데 도움이 됨. 카카오를 사용할 수 없는 사용자를 위해 로컬 ID/비밀번호 로그인도 지원함.

### 로그인 옵션

- 카카오 로그인 버튼 (게이트웨이를 통한 OAuth 흐름).
- 로컬 ID/비밀번호 로그인 (게이트웨이에서 관리).
- Passkey는 향후 옵션으로 고려; 필요시 나중에 정의.
- 활성 세션이 있을 때 자동 로그인을 지원해야 함.

### 세션 및 SSO 유사 동작

- 게이트웨이가 로그인을 처리하고 Redis에서 기본 세션을 소유함.
- 게임 서버는 서로 다른 브랜치를 실행할 수 있음; 게이트웨이를 중앙 SSO 권위자로 취급하여 각 서버+시나리오 프로필에 대한 세션 토큰을 발행함.
- API 서버는 Redis에서 토큰을 검증하고 게이트웨이가 발행한 세션을 재인증 없이 수락함.
- 세션 토큰은 서버 간 유출을 방지하기 위해 서버+시나리오 프로필별로 범위를 제한해야 함.

### 운영 참고 사항

- 가능한 경우 세션 토큰에 HTTP-only 보안 쿠키를 선호함.
- Redis에서 토큰을 취소하는 로그아웃 흐름을 제공함.
- 감사 및 남용 탐지를 위해 마지막 로그인 및 세션 메타데이터를 추적함.

## 엔진 런타임 흐름 (Engine Runtime Flow - Draft)

### 턴 데몬 루프 (Turn Daemon Loop)

- 턴 데몬은 단일 스레드 루프로 실행됨.
- 데몬 엔진은 메모리 내 상태를 기본 작업 세트로 사용함.
- 데몬은 이벤트 루프 동안 두 가지 조건을 기다림.
  - 외부 API 서버로부터의 쿼리/커맨드 요청.
  - 다음 턴의 예약된 시작 시간.
- 다음 턴 시작 시간에 도달할 때까지 외부 요청을 처리함.
  - 요청이 없으면 다음 턴 시작 시간까지 대기함.
  - 다음 턴 시작 시간이 되면 요청이 큐에 남아 있더라도 즉시 턴 처리를 시작함.
- 데몬이 턴을 해결하는 동안 API 서버는 들어오는 요청을 큐에 쌓음.

참고: 현재 구현은 턴 사이의 API 뮤테이션 요청을 아직 처리하지 않으며, 제어 명령만 프로세스 내 큐에서 처리됨.

### 데몬 제어 계약 (Daemon Control Contract - Draft)

API 서버 명령은 제어 채널(Redis Stream 또는 프로세스 내)을 통해 데몬에 전달됨. 데몬은 상태 및 실행 이벤트로 응답함.

```ts
export type RunReason = "schedule" | "manual" | "poke";

export type DaemonCommand =
  | {
      type: "run";
      reason: RunReason;
      targetTime?: string;
      budget?: TurnRunBudget;
    }
  | { type: "pause"; reason?: string }
  | { type: "resume"; reason?: string }
  | { type: "getStatus"; requestId: string };

export type DaemonEvent =
  | { type: "status"; requestId?: string; status: TurnDaemonStatus }
  | { type: "runStarted"; at: string; reason: RunReason }
  | { type: "runCompleted"; at: string; result: TurnRunResult }
  | { type: "runFailed"; at: string; error: string };
```

### API 서버 흐름

- API 서버는 쿼리/커맨드를 검증하고 Redis Streams 또는 Redis pub/sub에 기록함.
- 요청이 처리된 후 API 서버는 결과를 클라이언트에 반환함.
- 읽기 전용 쿼리는 DBMS에 직접 액세스할 수 있음.
- API 서버는 SSE를 사용하여 프론트엔드에 실시간 업데이트를 스트리밍할 수 있음.

### 큐 및 속도 제한 (Queue and Rate Limits)

- API 서버 요청은 Redis Streams 또는 Redis pub/sub을 통해 데몬에 전달됨.
- Redis Stream 뮤테이션 요청은 사용자당 속도가 제한됨.
  - 각 사용자는 최대 30개의 대기 중인 뮤테이션 요청을 가질 수 있음.
  - 한도를 초과하면 추가 요청은 거부됨.

### 메모리 내 처리 및 DBMS 플러시 (In-Memory and DBMS Flush)

- 데몬은 기본적으로 메모리 내 상태에 대해 작업을 처리함.
- DBMS 쓰기는 턴 처리가 완료된 후 일괄적으로 플러시됨.
- 자주 변경되는 "다음 턴 의도(next-turn intent)" 데이터는 별도로 저장됨.
  - API 서버는 이 데이터를 DBMS에 유지함.
  - 데몬은 다음 턴이 시작될 때 이 데이터만 로드함.

## 게임 로직 테스트 (Game Logic Testing - Draft)

### 결정론적 입력

- RNG 시드 구성 (숨겨진 서버 시드, 턴 정보, 장수 정보).
- 시나리오 선택 및 시나리오 데이터.
- 트리거 세트 입력: 국가, 장수, 도시 상태.
- 게임 시간 및 틱 일정.

### 권장 유닛 테스트 흐름

- 결정론적 테스트 픽스처(모의 DB 또는 메모리 상태 스냅샷)를 준비함.
- 고정된 입력과 시드로 게임 로직 유닛 테스트를 실행함.
- 예상 출력과 DBMS에 기록될 플러시 전 변경 세트를 비교함.

### 참고 사항

- 결정론적 RNG는 출력 비교를 안정적이고 반복 가능하게 만듦.
- 회귀를 쉽게 추적할 수 있도록 입력/출력 스냅샷을 선호함.
  - Use consumer groups for daemon workers and API server listeners.
  - Require `requestId` for correlation and idempotency.
  - Ack on success; move failed items to a dead-letter stream after retry.
- Redis pub/sub:
  - Daemon -> API server: low-stakes live update signals (run started/ended).
  - API server -> frontend: SSE fan-out triggered by pub/sub updates.
  - Do not use pub/sub for data that must be replayed or audited.

## Engine Runtime Flow (Draft)

### Turn Daemon Loop

- The turn daemon runs as a single-threaded loop.
- The daemon engine uses in-memory state as the primary working set.
- The daemon waits on two conditions during the event loop.
  - Query/command requests from the external API server.
  - The scheduled start time of the next turn.
- External requests are processed until the next turn start time is reached.
  - If no requests arrive, the daemon waits until the next turn start time.
  - When the next turn start time arrives, the daemon starts turn processing immediately even if requests remain queued.
- While the daemon is resolving a turn, the API server queues incoming requests.

### Daemon Control Contract (Draft)

API server commands are delivered to the daemon over the control channel (Redis Stream or in-process). The daemon replies with status and run events.

```ts
export type RunReason = "schedule" | "manual" | "poke";

export type DaemonCommand =
  | {
      type: "run";
      reason: RunReason;
      targetTime?: string;
      budget?: TurnRunBudget;
    }
  | { type: "pause"; reason?: string }
  | { type: "resume"; reason?: string }
  | { type: "getStatus"; requestId: string };

export type DaemonEvent =
  | { type: "status"; requestId?: string; status: TurnDaemonStatus }
  | { type: "runStarted"; at: string; reason: RunReason }
  | { type: "runCompleted"; at: string; result: TurnRunResult }
  | { type: "runFailed"; at: string; error: string };
```

## Authentication and Session Management (Draft)

Login uses Kakao OAuth as the primary identity provider because it leverages Korean real-name verification and helps prevent multi-account abuse. The system also supports local ID/password login for users who cannot use Kakao.

### Session and SSO-Like Behavior

- Gateway handles login and owns primary sessions in Redis.
- Game servers may run different branches; treat Gateway as a central SSO authority that issues session tokens for each server+scenario profile.
- API servers validate tokens against Redis and accept sessions issued by Gateway without re-authentication.
- Session tokens should be scoped by server+scenario profile to avoid cross-server leaks.

## In-Memory Processing and DBMS Flush (Outline)

- The daemon processes actions against in-memory state by default.
- DBMS writes are flushed in bulk after turn processing completes.
- Frequently changing "next-turn intent" data is stored separately.
  - The API server persists this data in the DBMS.
  - The daemon loads only this data when the next turn begins.

## Game Logic Testing (Draft)

### Deterministic Inputs

- RNG seed composition (hidden server seed, turn info, general info).
- Scenario selection and scenario data.
- Trigger set inputs: nation, general, and city state.
- Game time and tick schedule.

### Recommended Unit Test Flow

- Prepare a deterministic test fixture (mock DB or in-memory state snapshot).
- Execute game logic unit tests with fixed inputs and seeds.
- Compare expected outputs against the pre-flush change set that would be written to the DBMS.
