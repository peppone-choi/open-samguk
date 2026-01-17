/**
 * DB Integration Test - 실제 DB 연결 턴 엔진 테스트
 */
import { createGamePostgresConnector } from '@sammo-ts/infra';
import { describe, expect, test, beforeAll, afterAll } from 'vitest';
import { resolveDatabaseUrl } from '../src/scenario/databaseUrl.js';
import { loadTurnWorldFromDatabase } from '../src/turn/worldLoader.js';
import { InMemoryTurnWorld } from '../src/turn/inMemoryWorld.js';
import { InMemoryTurnProcessor } from '../src/turn/inMemoryTurnProcessor.js';
import { createReservedTurnHandler } from '../src/turn/reservedTurnHandler.js';
import { createReservedTurnStore } from '../src/turn/reservedTurnStore.js';
import type { TurnSchedule } from '@sammo-ts/logic/turn/calendar.js';

// 테스트용 스케줄 (TurnScheduleEntries 타입 만족)
const testSchedule: TurnSchedule = {
    entries: [{ startMinute: 0, tickMinutes: 10 }],
} as TurnSchedule;

const schema = process.env.POSTGRES_SCHEMA ?? 'public';
process.env.POSTGRES_SCHEMA = schema;

const canConnectToDatabase = async (url: string): Promise<boolean> => {
    const connector = createGamePostgresConnector({ url });
    try {
        await connector.connect();
        await (connector.prisma as any).$queryRawUnsafe('SELECT 1');
        return true;
    } catch {
        return false;
    } finally {
        await connector.disconnect();
    }
};

const databaseUrl = await resolveDatabaseUrl({ schema });
const canRun = await canConnectToDatabase(databaseUrl);
const describeDb = describe.runIf(canRun);

describeDb('Turn Engine DB Integration', () => {
    let initialGeneralCount: number;
    let initialState: { currentYear: number; currentMonth: number };

    test('should load world state from database', async () => {
        const { state, snapshot } = await loadTurnWorldFromDatabase({ databaseUrl });

        expect(state).toBeDefined();
        expect(state.id).toBeGreaterThan(0);
        expect(state.currentYear).toBeGreaterThan(0);
        expect(state.currentMonth).toBeGreaterThanOrEqual(1);
        expect(state.currentMonth).toBeLessThanOrEqual(12);

        expect(snapshot.generals.length).toBeGreaterThan(0);
        expect(snapshot.cities.length).toBeGreaterThan(0);
        expect(snapshot.nations.length).toBeGreaterThan(0);

        console.log(
            `Loaded: ${snapshot.generals.length} generals, ${snapshot.cities.length} cities, ${snapshot.nations.length} nations`
        );
        console.log(`World state: Year ${state.currentYear}, Month ${state.currentMonth}`);

        initialGeneralCount = snapshot.generals.length;
        initialState = { currentYear: state.currentYear, currentMonth: state.currentMonth };
    });

    test('should create InMemoryTurnWorld from loaded data', async () => {
        const { state, snapshot } = await loadTurnWorldFromDatabase({ databaseUrl });

        const world = new InMemoryTurnWorld(state, snapshot, {
            schedule: testSchedule,
            generalTurnHandler: { execute: () => ({}) },
        });

        expect(world.getState().currentYear).toBe(state.currentYear);
        expect(world.getState().currentMonth).toBe(state.currentMonth);
        expect(world.listGenerals().length).toBe(snapshot.generals.length);
        expect(world.listCities().length).toBe(snapshot.cities.length);
        expect(world.listNations().length).toBe(snapshot.nations.length);
    });

    test('should list due generals correctly', async () => {
        const { state, snapshot } = await loadTurnWorldFromDatabase({ databaseUrl });

        const world = new InMemoryTurnWorld(state, snapshot, {
            schedule: testSchedule,
            generalTurnHandler: { execute: () => ({}) },
        });

        // Find generals whose turn time has passed
        const now = new Date();
        const dueGenerals = world.listDueGenerals(now);

        console.log(`Due generals at ${now.toISOString()}: ${dueGenerals.length}`);

        // Verify due generals are sorted by turnTime
        for (let i = 1; i < dueGenerals.length; i++) {
            const prev = dueGenerals[i - 1];
            const curr = dueGenerals[i];
            expect(prev.turnTime.getTime()).toBeLessThanOrEqual(curr.turnTime.getTime());
        }
    });

    test('should execute turn with reserved turn handler', { timeout: 30000 }, async () => {
        const { state, snapshot } = await loadTurnWorldFromDatabase({ databaseUrl });

        const reservedTurnStoreHandle = await createReservedTurnStore({ databaseUrl });

        let worldRef: InMemoryTurnWorld | null = null;
        const handler = await createReservedTurnHandler({
            reservedTurns: reservedTurnStoreHandle.store,
            scenarioConfig: snapshot.scenarioConfig,
            scenarioMeta: snapshot.scenarioMeta,
            map: snapshot.map,
            unitSet: snapshot.unitSet,
            getWorld: () => worldRef,
        });

        const world = new InMemoryTurnWorld(state, snapshot, {
            schedule: testSchedule,
            generalTurnHandler: handler,
        });
        worldRef = world;

        const processor = new InMemoryTurnProcessor(world, { tickMinutes: 10 });

        // Run one batch of turns
        const targetTime = new Date();
        const result = await processor.run(targetTime, {
            budgetMs: 5000,
            maxGenerals: 50, // Limit to 50 generals for test
            catchUpCap: 1,
        });

        console.log(`Turn execution result:`);
        console.log(`  - Processed generals: ${result.processedGenerals}`);
        console.log(`  - Processed turns: ${result.processedTurns}`);
        console.log(`  - Duration: ${result.durationMs}ms`);
        console.log(`  - Partial: ${result.partial}`);

        expect(result.durationMs).toBeGreaterThanOrEqual(0);
        expect(result.processedGenerals).toBeGreaterThanOrEqual(0);

        // Consume dirty state to see what changed
        const dirty = world.consumeDirtyState();
        console.log(`  - Dirty generals: ${dirty.generals.length}`);
        console.log(`  - Logs generated: ${dirty.logs.length}`);

        await reservedTurnStoreHandle.close();
    });

    test('should maintain data consistency after turn execution', async () => {
        const { state, snapshot } = await loadTurnWorldFromDatabase({ databaseUrl });

        const world = new InMemoryTurnWorld(state, snapshot, {
            schedule: testSchedule,
            generalTurnHandler: { execute: (ctx) => ({ general: ctx.general }) },
        });

        const initialGeneralIds = new Set(world.listGenerals().map((g) => g.id));
        const initialCityIds = new Set(world.listCities().map((c) => c.id));
        const initialNationIds = new Set(world.listNations().map((n) => n.id));

        // Execute a few general turns manually
        const dueGenerals = world.listDueGenerals(new Date()).slice(0, 10);
        for (const general of dueGenerals) {
            world.executeGeneralTurn(general);
        }

        // Verify no data was lost
        const finalGenerals = world.listGenerals();
        const finalCities = world.listCities();
        const finalNations = world.listNations();

        expect(finalGenerals.length).toBe(snapshot.generals.length);
        expect(finalCities.length).toBe(snapshot.cities.length);
        expect(finalNations.length).toBe(snapshot.nations.length);

        // Verify all original IDs still exist
        for (const general of finalGenerals) {
            expect(initialGeneralIds.has(general.id)).toBe(true);
        }
        for (const city of finalCities) {
            expect(initialCityIds.has(city.id)).toBe(true);
        }
        for (const nation of finalNations) {
            expect(initialNationIds.has(nation.id)).toBe(true);
        }
    });
});
