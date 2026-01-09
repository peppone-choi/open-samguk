# Implementation Handoff: Auction System & General Services

## Overview

This phase focused on implementing the core Auction System to match legacy PHP functionality and enhancing the General Service to support frontend needs. The auction logic, including unique item handling and resource bidding, has been ported to the domain layer and integrated into the `AuctionService`.

## Completed Features

### 1. Auction System Core (`packages/logic`)

- **Domain Models**:
  - `AuctionFactory`: Factory for creating auction instances (`UniqueItem`, `BuyRice`, `SellRice`).
  - `AuctionUniqueItem`: Logic for unique item auctions, including checks for item possession limits (1-3 based on year) and duplicate slot items.
  - `AuctionBasicResource`: Abstract base for resource auctions (`BuyRice`, `SellRice`) handling resource transfers.
  - `BaseAuction`: Common logic for bidding validation, duration extension (5-minute rule), and obfuscated name generation.
- **Service Layer (`apps/api`)**:
  - `AuctionService.bid`: Handles bidding transactions, resource deductions (Gold/Rice/InheritancePoint), refunds to previous bidders, and bid recording.
  - `processFinishedAuctions`: Scheduled task (runs every 1 min) to settle finished auctions, acting as the "Auction Clerk". Handles item/resource transfers and host refunds on failure.
  - **Resource Management**: Implemented `incrementResource` helper to correctly handle `inheritancePoint` stored in `General.aux` JSON and standard `gold`/`rice` fields.

### 2. Frontend Integration (`apps/web`)

- **Context API**:
  - `GeneralContext`: Added `GeneralProvider` to manage the globally selected `generalId`, persisting it in `localStorage`.
  - Integrated `useGeneral()` hook into `AuctionPage` to allow bidding with the selected general.
- **UI Components**:
  - `ConnectedUsers`: Direct port of "Active Users" display, showing real-time connected generals with nation colors.
  - `AuctionPage`: Full UI for listing auctions, filtering by type, viewing details, and placing bids.
  - `Dashboard`: Integrated `ConnectedUsers` and cleaned up layout.

### 3. Data & Scenarios

- **Scenario Migration**: Moved all 85+ scenario JSON files from `legacy/hwe/scenario` to `packages/logic/src/data/scenarios`.
- **Loader**: Updated `ScenarioLoader` to read from the new package-internal path.

## Known Issues & Blockers

- **Build Errors in `@sammo/logic`**:
  - The `packages/logic` package currently fails to build (`tsc` errors) due to missing exports and type mismatches in the `triggers` and `specials` modules (e.g., `NoSpecialWar` import error).
  - **Action Required**: Fix the exports in `packages/logic/src/domain/specials/war/index.ts` and resolve type errors in `triggers` before deploying.
- **Inheritance Point**: Currently stored in `General.aux` as a JSON field. This is a temporary measure until the `H4` migration (User/General separation) is fully modeled.

## Next Steps

1.  **Fix Logic Build**: Resolve the `ERR_MODULE_NOT_FOUND` and type errors in `packages/logic` to ensure a stable build.
2.  **Verify Scenario Data**: Run the scenario verification script to ensure all migrated JSON files load correctly with the new `ScenarioLoader`.
3.  **Refine Auction UI**: Add visual feedback for successful bids and real-time updates (using simple polling or subscription if available).
4.  **Implement Monthly Pipeline**: Integrate `processFinishedAuctions` into a centralized `MonthlyPipeline` if the 1-minute interval needs to be synchronized with game turns.
