import { describe, it, expect, beforeEach } from 'vitest';
import {
    ITEM_KEYS,
    ItemLoader,
    loadItemModules,
    createItemModuleRegistry,
    isItemKey,
    type ItemKey,
} from '../../src/items/index.js';
import type { ItemModule } from '../../src/items/types.js';

describe('ItemLoader', () => {
    let loader: ItemLoader;

    beforeEach(() => {
        loader = new ItemLoader();
    });

    describe('load', () => {
        it('should load a valid item module', async () => {
            const module = await loader.load('che_무기_15_의천검');
            expect(module).toBeDefined();
            expect(module.key).toBe('che_무기_15_의천검');
            expect(module.slot).toBe('weapon');
            expect(module.rawName).toBe('의천검');
        });

        it('should cache loaded modules', async () => {
            const first = await loader.load('che_무기_15_의천검');
            const second = await loader.load('che_무기_15_의천검');
            expect(first).toBe(second);
        });

        it('should throw for unknown item key', async () => {
            const invalidLoader = new ItemLoader({} as Record<ItemKey, () => Promise<{ itemModule: ItemModule }>>);
            await expect(invalidLoader.load('che_무기_15_의천검')).rejects.toThrow('Unknown item key');
        });
    });

    describe('loadItemModules', () => {
        it('should load multiple modules', async () => {
            const modules = await loadItemModules(['che_무기_15_의천검', 'che_명마_15_적토마'], loader);
            expect(modules).toHaveLength(2);
            expect(modules[0]?.key).toBe('che_무기_15_의천검');
            expect(modules[1]?.key).toBe('che_명마_15_적토마');
        });

        it('should deduplicate keys', async () => {
            const modules = await loadItemModules(
                ['che_무기_15_의천검', 'che_무기_15_의천검', 'che_무기_15_의천검'],
                loader
            );
            expect(modules).toHaveLength(1);
        });

        it('should return empty array for empty keys', async () => {
            const modules = await loadItemModules([], loader);
            expect(modules).toHaveLength(0);
        });
    });

    describe('createItemModuleRegistry', () => {
        it('should create a registry from modules', async () => {
            const modules = await loadItemModules(['che_무기_15_의천검', 'che_명마_15_적토마'], loader);
            const registry = createItemModuleRegistry(modules);
            expect(registry.size).toBe(2);
            expect(registry.get('che_무기_15_의천검')).toBeDefined();
            expect(registry.get('che_명마_15_적토마')).toBeDefined();
        });
    });
});

describe('isItemKey', () => {
    it('should return true for valid item keys', () => {
        expect(isItemKey('che_무기_15_의천검')).toBe(true);
        expect(isItemKey('che_명마_15_적토마')).toBe(true);
        expect(isItemKey('che_반계_백우선')).toBe(true);
    });

    it('should return false for invalid keys', () => {
        expect(isItemKey('invalid_key')).toBe(false);
        expect(isItemKey('')).toBe(false);
        expect(isItemKey('che_unknown_item')).toBe(false);
    });
});

describe('ITEM_KEYS', () => {
    it('should contain all registered items', () => {
        // 현재 등록된 아이템 수: 126개 (che_* 아이템, event_* 아이템 제외)
        expect(ITEM_KEYS.length).toBeGreaterThanOrEqual(126);
    });

    it('should include weapon items', () => {
        const weaponItems = ITEM_KEYS.filter((k) => k.includes('_무기_'));
        expect(weaponItems.length).toBeGreaterThan(0);
    });

    it('should include horse items', () => {
        const horseItems = ITEM_KEYS.filter((k) => k.includes('_명마_'));
        expect(horseItems.length).toBeGreaterThan(0);
    });

    it('should include book items', () => {
        const bookItems = ITEM_KEYS.filter((k) => k.includes('_서적_'));
        expect(bookItems.length).toBeGreaterThan(0);
    });

    it('should include special items', () => {
        expect(ITEM_KEYS).toContain('che_반계_백우선');
        expect(ITEM_KEYS).toContain('che_반계_파초선');
        expect(ITEM_KEYS).toContain('che_위압_조목삭');
    });
});

describe('All items loadable', () => {
    it('should load all 127 items without error', async () => {
        const loader = new ItemLoader();
        const results: Array<{ key: string; success: boolean; error?: unknown }> = [];

        for (const key of ITEM_KEYS) {
            try {
                const module = await loader.load(key);
                expect(module.key).toBe(key);
                results.push({ key, success: true });
            } catch (error) {
                results.push({ key, success: false, error });
            }
        }

        const failures = results.filter((r) => !r.success);
        if (failures.length > 0) {
            console.error('Failed to load items:', failures);
        }
        expect(failures).toHaveLength(0);
    }, 30000); // 30s timeout for loading all items

    it('should have consistent module structure for all items', async () => {
        const loader = new ItemLoader();

        for (const key of ITEM_KEYS) {
            const module = await loader.load(key);

            // Required fields
            expect(module.key).toBe(key);
            expect(typeof module.name).toBe('string');
            expect(typeof module.rawName).toBe('string');
            expect(typeof module.info).toBe('string');
            expect(['horse', 'weapon', 'book', 'item']).toContain(module.slot);
            expect(typeof module.buyable).toBe('boolean');
            expect(typeof module.consumable).toBe('boolean');
            expect(typeof module.reqSecu).toBe('number');
            expect(typeof module.unique).toBe('boolean');

            // Cost can be null or number
            if (module.cost !== null) {
                expect(typeof module.cost).toBe('number');
            }
        }
    }, 30000);
});
