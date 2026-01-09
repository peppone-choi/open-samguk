# apps/engine

**Turn Daemon - game state authority**

## OVERVIEW

Headless NestJS process owning game state. Processes turns, advances months, persists snapshots. NOT an HTTP server.

## STRUCTURE

```
src/
├── main.ts           # Entry: NestFactory.createApplicationContext
└── engine.service.ts # Main game loop
```

## EXECUTION FLOW

```
1. Load WorldSnapshot from DB
2. Loop (every TURN_INTERVAL ~10s):
   a. stepGenerals() - process queued commands
   b. Check shouldAdvanceMonth()
   c. If month end: run MonthlyPipeline
3. Flush WorldDelta to DB via SnapshotRepository
4. Publish events via Redis
```

## WHERE TO LOOK

| Task              | Location                                       |
| ----------------- | ---------------------------------------------- |
| Turn processing   | `engine.service.ts`                            |
| Game logic        | `packages/logic/src/domain/`                   |
| State persistence | `packages/logic/src/persistence/`              |
| Monthly events    | `packages/logic/src/domain/MonthlyPipeline.ts` |

## PATTERNS

### In-Memory Authority

```
Engine Memory = Source of Truth
Database = Backup/Journal

Never query DB for current state during turn processing.
Always use loaded WorldSnapshot.
```

### Turn Processing

```typescript
async processTurn() {
  const snapshot = await this.loadSnapshot();
  const commands = await this.getQueuedCommands();

  for (const cmd of commands) {
    const delta = cmd.run(snapshot, this.rng);
    this.applyDelta(snapshot, delta);
  }

  await this.persist(snapshot);
}
```

## CONVENTIONS

- Single instance per game world
- Deterministic processing (seeded RNG)
- Atomic delta application
- Event emission after state change

## ANTI-PATTERNS

- HTTP endpoints (this is not a web server)
- Direct DB queries during turn (use snapshot)
- Non-deterministic logic (random without seed)
- Shared mutable state between turns
