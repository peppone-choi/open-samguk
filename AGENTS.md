# Repository Guidelines

## 프로젝트 범위
이 저장소는 레거시 삼국지 모의전투 서버를 NestJS/Next.js로 포팅하기 위한 문서와 계획 중심의 작업 공간이다. `legacy/`는 마이그레이션 대상이자 동작/결과 비교를 위한 참조 기준이다.

## 프로젝트 구조 & 모듈 조직
- `docs/` 아키텍처/테스트/포팅 계획 문서. 시작점은 `docs/architecture/overview.md`.
- `legacy/` 마이그레이션 대상인 레거시 서버/클라이언트 코드와 테스트/빌드 도구(참조 및 패리티 비교용).
- `apps/api` NestJS 백엔드 스캐폴딩.
- `apps/web` Next.js 프론트엔드 스캐폴딩(Tailwind + shadcn/ui 사용).
- `apps/web/src/components/ui` shadcn/ui 컴포넌트 모음.
- `packages/*` 공통 모듈 예정 영역.
- `tsconfig.base.json` 포팅 코드의 공통 TypeScript 엄격 설정.

## 빌드, 테스트, 개발 명령
루트:
- `npm run lint`, `npm run test` 는 현재 플레이스홀더 출력.

레거시:
- `npm --prefix legacy run build` webpack 프로덕션 빌드.
- `npm --prefix legacy run buildDev` 또는 `npm --prefix legacy run watch` 개발용 빌드/감시.
- `npm --prefix legacy run lint` ESLint(V**ue + TypeScript**).
- `npm --prefix legacy run test` PHPUnit + Mocha 테스트.
- `composer install` (경로 `legacy/`) 후 `npm --prefix legacy run test-php-gateway` 가능.

신규 스캐폴딩:
- `npm --prefix apps/web run dev` Next.js 개발 서버.
- `npm --prefix apps/api run start:dev` NestJS 개발 서버.
- `npm --prefix apps/api run db:migrate` TypeORM 마이그레이션 적용.
- `npm --prefix apps/api run db:revert` 마지막 마이그레이션 롤백.

UI 컴포넌트:
- `npx shadcn@latest add button`처럼 `apps/web`에서 shadcn/ui 컴포넌트 추가.

## 코딩 스타일 & 네이밍 규칙
- 레거시 TS/Vue는 `legacy/.eslintrc.cjs`, `legacy/.prettierrc` 기준(2칸 들여쓰기, 120자).
- 레거시 파일은 대규모 포맷 변경을 피하고, 변경 범위를 최소화한다.
- 새 코드도 `tsconfig.base.json`의 엄격 설정을 지키고, 경계 API는 명시적 타입을 권장.
- UI 기본 톤은 회색(중립)이며, 국가별 색상 테마는 후속 단계에서 추가한다.
- 백엔드는 REST API와 TypeORM을 기준으로 설계한다.

## 테스트 가이드
`docs/testing-policy.md` 기준으로 결정론 재현, RNG 시드 관리, 스냅샷/저널 복구 검증을 우선한다. 포팅 시 `legacy/` 결과와의 패리티 테스트를 추가한다.

## 커밋 & PR 가이드
현재 히스토리는 `first commit` 하나뿐이라 관례가 없다. 커밋 제목은 간결한 명령형(예: "Add legacy parity notes")을 사용하고, PR에는 변경 요약과 문서 업데이트 여부를 명시한다.


# Repository Guidelines

## Project Goal (Rewrite)
- This repository is transitioning from the legacy PHP codebase to a TypeScript-based monorepo using pnpm workspaces.
- The legacy game remains the current active source under `legacy/` while the rewrite is prepared alongside it.
- Legacy data under `legacy/` is for migration only; once DB migration is complete,
  the runtime will no longer depend on legacy data.

## Project Naming
- Official name: 삼국지 모의전투 HiDCHe
- Common nicknames: 삼모, 삼모전, 힏체섭
- Short forms in code/docs: sammo, hidche
- TypeScript rewrite working name: sammo-ts

## Project Structure & Module Organization
- `legacy/` contains the application source. This is the active codebase.
- PHP entry points live under `legacy/` and `legacy/hwe/` (for example `legacy/index.php`, `legacy/hwe/index.php`).
- `legacy/` is mostly a shell; `legacy/src/` is largely unused.
- Core PHP domain logic lives under `legacy/hwe/sammo/` (PSR-4 `sammo\\` namespace).
- Frontend TypeScript/Vue sources are in `legacy/hwe/ts/` with shared components in `legacy/hwe/ts/components/`.
- Styles are split between `legacy/css/` and SCSS in `legacy/hwe/scss/`.
- Tests: PHPUnit in `legacy/tests/`, TypeScript tests in `legacy/hwe/test-ts/`.
- Static data/assets: scenarios in `legacy/hwe/scenario/`, templates in `legacy/hwe/templates/`.

## Legacy Endpoint Patterns
- JSON API handlers: `legacy/hwe/j_*.php`.
- Vue multi-entry pages: `legacy/hwe/v_*.php`.
- Legacy PHP + jQuery pages: `legacy/hwe/b_*.php` with POST handlers in `legacy/hwe/c_*.php`.
- Modern API router: `legacy/hwe/api.php` accepts a path argument and dispatches to `legacy/hwe/API/` modules.

## Project Structure & Module Organization
- `legacy/`: contains the application source. This is the active codebase.
- `packages/common`: shared utilities and type definitions (RNG, bytes, etc.).
- `packages/infra`: TypeORM/Prisma/Redis connectors and other runtime infra.
- `packages/logic`: pure game logic with DI/interfaces for external dependencies.
- `apps/api`: NestJS backend service (Game & Gateway API).
- `apps/engine`: Game engine / turn daemon (Node.js/NestJS).
- `apps/web`: Next.js frontend application (Gateway & Game UI).
- `tools/build-scripts`: build and deployment scripts.
- `docs/`: architecture/test/porting plan documents.

## Legacy Endpoint Patterns
- JSON API handlers: `legacy/hwe/j_*.php`.
- Vue multi-entry pages: `legacy/hwe/v_*.php`.
- Legacy PHP + jQuery pages: `legacy/hwe/b_*.php` with POST handlers in `legacy/hwe/c_*.php`.
- Modern API router: `legacy/hwe/api.php` accepts a path argument and dispatches to `legacy/hwe/API/` modules.

## Planned Runtime & Tooling
- Backend: Node.js + NestJS, with TypeORM/Prisma.
- Turn daemon: turn scheduler/resolver service for game ticks.
- Turn daemon and API server communicate via Redis Stream or Redis pub/sub.
- API server and frontend communicate via tRPC + zod.
- API server and frontend may use SSE for live updates.
- Frontend: Next.js, TailwindCSS, shadcn/ui.
- Data: PostgreSQL; sessions backed by Redis.
- Testing: Vitest / Jest.
- Package manager: pnpm (workspace-based monorepo).
- Build output: server builds emitted to `/dist/{profileName}` per profile.

## Suggested Monorepo Scripts (Proposal)
These are placeholders to align teams; adjust once packages exist.
- `pnpm install`: install all workspace dependencies.
- `pnpm -r lint`: lint all packages.
- `pnpm -r test`: run all unit tests (Vitest where configured).
- `pnpm -r build`: build all packages/apps.
- `pnpm -r dev`: run dev servers where applicable.
- `pnpm --filter ./app/game-frontend dev`: run a single app by filter.
- `pnpm --filter ./app/game-api dev`: run a single service by filter.
- `pnpm --filter ./app/game-engine dev`: run a single service by filter.

## Development Checklist (AI)
- After code changes, verify TypeScript type checks (prefer `pnpm -r build` or the package `tsc`).
- When changes require unit tests, run the relevant tests.

## Build Profiles (Proposal)
- A build profile is a server+scenario pair; scenario selection is required even if a default exists.
- Server builds should accept a profile (server variant) plus an explicit scenario file input.
- Recommended pattern: a `tools/build-scripts` runner invoked by pnpm, e.g. `pnpm build:server --profile che --scenario default`.
- Prefer environment variables for CI/CD (`PROFILE=che SCENARIO=default pnpm build:server`) and a small wrapper script for local usage.
- Build output stays in `/dist/{profileName}` per profile to keep deployments predictable.
- Profile selection can target different git branches or specific commits; server operators decide the compatibility baseline.
- The scenario file determines unit sets and DB settings that must be prepared before build output is emitted.

## Server Profiles (Planned)
- Server IDs: `che`, `kwe`, `pwe`, `twe`, `nya`, `pya`
- Each build/run profile combines a server ID with a scenario selection.

## Game Domain Notes (Behavioral Context)
- Turn-based multiplayer loop with configurable tick length (historically 120/60/30/20/10/5/2/1 min; experimental day/night schedules).
- Core stats: leadership, strength, intelligence with effects on internal affairs and combat.
- Traits and modifiers apply via the Trigger system, evaluated by priority; "attempt" then "execute".
- Scenarios define maps, NPCs, initial resources; scenario loading separated to allow future modding.
- "Unit packs" bundle unit graphics, audio, and special effects per scenario.

## Randomness Policy (Verifiable RNG)
- All game-impacting randomness must be verifiable and reproducible from a deterministic seed.
- Prefer reusing the existing TypeScript implementations: `legacy/hwe/ts/util/LiteHashDRBG.ts` and `legacy/hwe/ts/util/RNG.ts` with minimal or no changes.
- Seed composition should include a hidden base seed plus action context (action type, time, actor, target) so results can be re-validated later.
- Do not introduce ad-hoc randomness in game logic; allow non-deterministic randomness only for non-gameplay, cosmetic, or UI-only cases.

## Coding Style & Naming Conventions
- Follow repo lint/format configuration once it exists; keep diffs consistent within a file.
- Indentation: 4 spaces for TypeScript, JSON, and Vue SFCs.
- Prefer explicit types for public APIs; avoid `any` and narrow `unknown`.
- Vue components: PascalCase filenames; composables use `useX` naming.
- Use `camelCase` for variables/functions and `PascalCase` for classes/types.
- Legacy concepts may use Korean identifiers; preserve Korean naming when it improves maintainability.
- Hybrid naming is acceptable (e.g., `use전투규칙`, `use도시상태`) when the prefix is conventional but the domain term is Korean.
- For classes, commands, and domain logic, add clear Korean comments to support Korean readers and future maintainers.

## Commit & Pull Request Guidelines
- Git history is minimal and does not define a strict convention; use short, imperative messages (e.g., "Fix map cache loading").
- PRs should include a concise description, testing notes/commands, and screenshots for UI changes.

## Architecture References
- Overview: `docs/architecture/overview.md`.
- Legacy engine map: `docs/architecture/legacy-engine.md`.
- TypeScript rewrite plan: `docs/architecture/rewrite-plan.md`.
- Runtime and build profiles: `docs/architecture/runtime.md`.

## Documentation Workflow
- When AI proposes future improvements or expansions, record them in
  `docs/architecture/todo.md` with an "AI suggestion" label.