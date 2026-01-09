# apps/api

**NestJS + tRPC gateway**

## OVERVIEW

Stateless API server. Handles auth, routes requests to domain logic, no game state ownership. Default port 4000.

## STRUCTURE

```
src/
├── main.ts           # Entry: NestFactory + FastifyAdapter
├── app.module.ts     # Root NestJS module
├── trpc/
│   ├── trpc.router.ts    # Route definitions
│   └── trpc.service.ts   # Context + procedures
├── auth/
│   ├── auth.router.ts    # Login, register, OAuth
│   ├── auth.service.ts   # JWT handling (jose)
│   └── password.service.ts # Legacy-compatible hashing
└── game/
    └── game.service.ts   # Game session management
```

## WHERE TO LOOK

| Task                | Location                                        |
| ------------------- | ----------------------------------------------- |
| Add tRPC route      | `trpc/trpc.router.ts`                           |
| Auth logic          | `auth/auth.service.ts`                          |
| Protected procedure | Use `protectedProcedure` from `trpc.service.ts` |
| Admin procedure     | Use `adminProcedure` (grade >= 5)               |

## PATTERNS

### tRPC Procedure Types

```typescript
procedure; // Public
protectedProcedure; // Requires valid JWT
adminProcedure; // Requires user.grade >= 5
```

### Context Factory

```typescript
// Extracts JWT from Authorization header
const ctx = {
  user: await authService.verifyToken(token),
  db: prismaClient,
};
```

### Route Registration

```typescript
export const appRouter = router({
  auth: authRouter,
  game: gameRouter,
  auction: auctionRouter,
});
```

## CONVENTIONS

- Services injected via NestJS DI
- Validation via Zod schemas in tRPC inputs
- Errors thrown as `TRPCError` with appropriate codes

## ANTI-PATTERNS

- Game state storage in API (belongs in Engine)
- Direct DB writes during turns (use Engine)
- Blocking operations in request handlers
