# Open Samguk

## Project Overview
Open Samguk is a comprehensive porting project aimed at modernizing a legacy "Three Kingdoms" simulation game. The goal is to migrate the existing PHP/Vue application to a modern stack using NestJS for the backend and Next.js for the frontend, while maintaining strict behavioral parity with the original system.

The project is structured as a monorepo containing both the new implementation (`apps/`) and the legacy reference code (`legacy/`).

### Tech Stack
*   **Monorepo Management:** npm workspaces
*   **Backend (`apps/api`):** NestJS, TypeORM, Postgres, WebSocket, SSE.
*   **Frontend (`apps/web`):** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui.
*   **Legacy Reference (`legacy/`):** PHP, MySQL, Vue.js, Webpack.
*   **Documentation:** Extensive architectural documentation in `docs/`.

## Architecture Highlights
*   **Source of Truth:** The backend's **in-memory state** is the primary source of truth.
*   **Persistence:** Postgres is used for persistence (snapshots and journals), not as the primary runtime state.
*   **Command/Query Separation:** Uses a variation of CQRS where commands and queries interact with the in-memory state.
*   **Real-time:** WebSocket is used for private/nation channels and immediate command results; SSE is used for global events and turn ticks.
*   **Determinism:** Strong focus on deterministic RNG and replayability for testing and verification.

## Getting Started

### Prerequisites
*   Node.js (v20+ recommended)
*   Docker (for Postgres/MySQL services)

### Key Commands

**Root Workspace:**
*   `npm install`: Install dependencies for all workspaces.

**Backend (`apps/api`):**
*   `npm --prefix apps/api run start:dev`: Start the NestJS development server.
*   `npm --prefix apps/api run db:migrate`: Run TypeORM migrations.
*   `npm --prefix apps/api run test`: Run Jest tests.

**Frontend (`apps/web`):**
*   `npm --prefix apps/web run dev`: Start the Next.js development server.
*   `npm --prefix apps/web run lint`: Run linting.

**Legacy (`legacy/`):**
*   `npm --prefix legacy run build`: Build the legacy Vue app.
*   `npm --prefix legacy run test`: Run legacy tests (PHPUnit/Mocha).

## Directory Structure
*   `apps/api`: The new NestJS backend application.
*   `apps/web`: The new Next.js frontend application.
*   `docs/`: Project documentation. Start with `docs/architecture/overview.md`.
*   `legacy/`: The complete legacy codebase (PHP backend + Vue frontend). Use this as the reference for logic and behavior.
*   `packages/`: Shared libraries (planned).

## Development Conventions
*   **Code Style:** strict TypeScript settings defined in `tsconfig.base.json`.
*   **UI/UX:** Use `shadcn/ui` components in `apps/web`. Keep the UI neutral (gray tones) initially.
*   **Testing:** Prioritize deterministic tests. Verify changes against the legacy implementation (parity testing).
*   **Database:** Use TypeORM for schema management in the new backend.
*   **Migration:** Refer to `docs/architecture/migrations.md` for the migration strategy.

## Key Documentation Files
*   **Overview:** `docs/architecture/overview.md` (Main Entry Point)
*   **Entities:** `docs/architecture/legacy-entities.md` (Legacy Entity Reference)
*   **Plan:** `docs/architecture/rewrite-plan.md` (Porting Roadmap)
*   **Testing:** `docs/testing-policy.md` (Testing Guidelines)
