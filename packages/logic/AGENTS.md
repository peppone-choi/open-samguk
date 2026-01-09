# packages/logic

**Pure domain logic - infrastructure agnostic**

## OVERVIEW

Core game engine: commands, constraints, triggers, events, items. 563 files. Zero NestJS/Prisma/Next.js dependencies.

## STRUCTURE

```
src/domain/
├── commands/         # GeneralCommand, NationCommand
├── constraints/      # 73 rule validators
├── triggers/war/     # 38 combat triggers
├── events/month/     # Monthly processing
├── items/            # weapons/, horses/, unique/
└── models/           # General, City, Nation entities
```

## WHERE TO LOOK

| Task           | Location                                       |
| -------------- | ---------------------------------------------- |
| Add command    | `domain/commands/` - extend base command class |
| Add constraint | `domain/constraints/` + ConstraintHelper       |
| Combat logic   | `WarEngine.ts` + `triggers/war/`               |
| Item effects   | `domain/items/` - iAction hooks                |

## PATTERNS

### Command Lifecycle

```typescript
cmd.checkConstraints("precheck"); // UI validation
cmd.checkConstraints("full"); // Before run
const delta = cmd.run(snapshot, rng); // Returns delta, NEVER mutates
```

### Trigger Priority

```
BEGIN=10000 → PRE=20000 → BODY=30000 → POST=40000 → FINAL=50000
```

### Delta Pattern

```typescript
return { generals: { [id]: { gold: -1000 } }, cities: { [cityId]: { pop: +500 } } };
```

## CONVENTIONS

- Always accept `rng: RandUtil` - determinism required
- Never mutate `WorldSnapshot` - return `WorldDelta`
- No `@nestjs/*` or `@prisma/*` imports

## KEY FILES

| File                  | Purpose                   |
| --------------------- | ------------------------- |
| `ConstraintHelper.ts` | 879 lines - rules factory |
| `WarEngine.ts`        | Combat simulation         |
| `GameEngine.ts`       | Central game loop         |
