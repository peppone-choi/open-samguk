# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-10
**Commit:** (auto-updated)
**Branch:** main

## OVERVIEW

**sammo-ts** - TypeScript rewrite of "삼국지 모의전투 HiDCHe" (Three Kingdoms War Simulation). Hybrid monorepo porting PHP 8.3 legacy to NestJS/Next.js with in-memory state architecture.

## STRUCTURE

```
open-samguk/
├── apps/
│   ├── api/          # NestJS + tRPC gateway (default port 4000)
│   ├── engine/       # Turn Daemon - owns game state
│   └── web/          # Next.js frontend (default port 3000)
├── packages/
│   ├── logic/        # Pure domain logic (563 files) - THE CORE
│   ├── infra/        # Prisma + Redis clients
│   └── common/       # RNG (LiteHashDRBG), JosaUtil
├── legacy/           # PHP 8.3 being ported
│   └── hwe/          # Core game logic (1071 files)
├── docker/
│   ├── legacy/       # PHP container
│   └── parity-bridge/# Legacy-TS comparison testing
└── docs/             # Architecture, porting status
```

## WHERE TO LOOK

| Task                | Location                                 | Notes                           |
| ------------------- | ---------------------------------------- | ------------------------------- |
| Game rules/commands | `packages/logic/src/domain/`             | Commands, Constraints, Triggers |
| Combat system       | `packages/logic/src/domain/WarEngine.ts` | Uses WarUnitTriggerRegistry     |
| API endpoints       | `apps/api/src/trpc/`                     | tRPC routers                    |
| Frontend pages      | `apps/web/src/app/(game)/`               | Next.js App Router              |
| Auth flow           | `apps/api/src/auth/`                     | JWT + Kakao OAuth               |
| DB schema           | `packages/infra/prisma/`                 | Prisma schema                   |
| Legacy reference    | `legacy/hwe/sammo/`                      | PHP classes being ported        |
| Porting status      | `docs/porting-status.md`                 | What's done/remaining           |

## ARCHITECTURE

**In-Memory Authority Pattern:**

- Engine owns game state in memory during runtime
- DB is journal/snapshot, NOT source of truth
- Commands produce `WorldDelta`, merged atomically

**Process Split:**

- `api`: Stateless request handler, validates + routes
- `engine`: Stateful turn processor, advances game time
- `web`: Pure UI, consumes API via tRPC

**Communication:**

- Web ↔ API: tRPC (type-safe)
- API → Engine: Redis Streams (commands)
- Engine → API: Redis Pub/Sub (events)

## CONVENTIONS

### TypeScript (Strict)

- `any` is **ERROR** - never use
- `@ts-ignore`, `@ts-expect-error` **FORBIDDEN**
- Unused vars: prefix with `_` (e.g., `_unused`)
- Double quotes, semicolons, 2-space indent

### Deterministic Logic (CRITICAL)

- **NEVER** use `Math.random()` - game logic must be reproducible
- **ALWAYS** use `LiteHashDRBG` from `@sammo/common`
- Same seed + input = identical output

### Naming

- Classes: `PascalCase`
- Methods/vars: `camelCase`
- Legacy field `aux` → modern field `meta`
- Game logic prefix: `che_` (legacy) → descriptive name (modern)

### Testing

- Framework: Vitest (modern), PHPUnit (legacy)
- Collocate tests: `*.test.ts` next to source
- Inject RNG for reproducibility

## ANTI-PATTERNS (FORBIDDEN)

| Pattern                        | Why                            |
| ------------------------------ | ------------------------------ |
| `as any`                       | Destroys type safety           |
| `@ts-ignore`                   | Hides real errors              |
| `Math.random()` in game logic  | Breaks determinism             |
| Direct DB mutation during turn | Violates in-memory authority   |
| `console.log`                  | Use structured ILogger         |
| `die()`/`exit()` in new code   | Legacy pattern, use exceptions |
| Empty catch blocks             | Swallows errors silently       |

## COMMANDS

```bash
# Development
pnpm install              # Install deps
pnpm dev:api              # API server (4000)
pnpm dev:web              # Web frontend (3000)
pnpm dev:engine           # Turn daemon

# Quality
pnpm test                 # Vitest
pnpm lint                 # ESLint
pnpm typecheck            # tsc --noEmit

# Database
pnpm db:generate          # Prisma generate
pnpm db:migrate           # Run migrations
pnpm db:push              # Push schema

# Build
pnpm build                # Build all packages
```

## PORTING STATUS

| Component        | Progress     | Notes |
| ---------------- | ------------ | ----- |
| Constraints      | 73/73 (100%) | Done  |
| War Triggers     | 38/38 (100%) | Done  |
| General Commands | 56/56 (100%) | Done  |
| Nation Commands  | 41/41 (100%) | Done  |
| Frontend Pages   | 18/18 (100%) | Done  |
| Auction System   | 6/6 (100%)   | Done  |
| Betting System   | 2/2 (100%)   | Done  |
| Inheritance      | 2/2 (100%)   | Done  |
| Tournament       | 2/2 (100%)   | Done  |

## NOTES

- **Parity Testing**: Use `docker-compose.parity.yml` to run PHP and TS side-by-side
- **Parity Bridge**: `docker/parity-bridge/` contains bridge service for comparison testing
- **Legacy Daemon**: `legacy/src/daemon.ts` drives PHP turns via HTTP
- **Korean Grammar**: Use `JosaUtil` for particle handling (은/는, 이/가)
- **Large Files**: `GeneralAI.php` (4293 lines) - main AI logic to port
- **Task Tracking**: See `HANDOFF.md` for available work items
