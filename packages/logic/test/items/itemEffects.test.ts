import { describe, it, expect, beforeEach } from 'vitest';
import { ItemLoader, loadItemModules, createItemModuleRegistry, type ItemKey } from '../../src/items/index.js';
import type { GeneralActionContext } from '../../src/triggers/general.js';
import type { General, Nation, StatBlock } from '../../src/domain/entities.js';

// 테스트용 목(mock) 데이터 생성 헬퍼
const createMockGeneral = (statsOverride?: Partial<StatBlock>): General => ({
    id: 1,
    name: '테스트장수',
    nationId: 1,
    cityId: 1,
    troopId: 0,
    stats: {
        leadership: statsOverride?.leadership ?? 50,
        strength: statsOverride?.strength ?? 50,
        intelligence: statsOverride?.intelligence ?? 50,
    },
    experience: 0,
    dedication: 0,
    officerLevel: 0,
    gold: 1000,
    rice: 1000,
    crew: 1000,
    crewTypeId: 0,
    train: 50,
    atmos: 50,
    age: 20,
    npcState: 0,
    injury: 0,
    role: {
        personality: null,
        specialDomestic: null,
        specialWar: null,
        items: {
            horse: null,
            weapon: null,
            book: null,
            item: null,
        },
    },
    triggerState: {
        counters: {},
        flags: {},
        modifiers: {},
        meta: {},
    },
    meta: {},
});

const createMockNation = (overrides: Partial<Nation> = {}): Nation => ({
    id: 1,
    name: '테스트국가',
    color: '#ff0000',
    capitalCityId: 1,
    chiefGeneralId: null,
    gold: 10000,
    rice: 10000,
    power: 0,
    level: 1,
    typeCode: 'che_중립',
    meta: {},
    ...overrides,
});

const createMockGeneralActionContext = (general: General, nation?: Nation | null): GeneralActionContext => ({
    general,
    nation: nation ?? createMockNation(),
});

describe('Item Effects - onCalcStat', () => {
    let loader: ItemLoader;

    beforeEach(() => {
        loader = new ItemLoader();
    });

    describe('Stat boost items (createStatItemModule)', () => {
        it('should boost strength for weapon items', async () => {
            const module = await loader.load('che_무기_15_의천검');
            const general = createMockGeneral({ strength: 50 });
            const context = createMockGeneralActionContext(general);

            expect(module.onCalcStat).toBeDefined();
            const result = module.onCalcStat!(context, 'strength', 50);
            expect(result).toBe(65); // 50 + 15
        });

        it('should not affect other stats', async () => {
            const module = await loader.load('che_무기_15_의천검');
            const general = createMockGeneral();
            const context = createMockGeneralActionContext(general);

            const leadership = module.onCalcStat!(context, 'leadership', 50);
            const intelligence = module.onCalcStat!(context, 'intelligence', 50);

            expect(leadership).toBe(50);
            expect(intelligence).toBe(50);
        });

        it('should boost leadership for horse items', async () => {
            const module = await loader.load('che_명마_15_적토마');
            const general = createMockGeneral({ leadership: 50 });
            const context = createMockGeneralActionContext(general);

            expect(module.onCalcStat).toBeDefined();
            const result = module.onCalcStat!(context, 'leadership', 50);
            expect(result).toBe(65); // 50 + 15
        });

        it('should boost intelligence for book items', async () => {
            const module = await loader.load('che_서적_15_손자병법');
            const general = createMockGeneral({ intelligence: 50 });
            const context = createMockGeneralActionContext(general);

            expect(module.onCalcStat).toBeDefined();
            const result = module.onCalcStat!(context, 'intelligence', 50);
            expect(result).toBe(65); // 50 + 15
        });
    });

    describe('Various stat level items', () => {
        const statTestCases: Array<{ key: ItemKey; stat: 'leadership' | 'strength' | 'intelligence'; bonus: number }> =
            [
                { key: 'che_무기_01_단도', stat: 'strength', bonus: 1 },
                { key: 'che_무기_07_동추', stat: 'strength', bonus: 7 },
                { key: 'che_무기_10_대부', stat: 'strength', bonus: 10 },
                { key: 'che_명마_01_노기', stat: 'leadership', bonus: 1 },
                { key: 'che_명마_07_기주마', stat: 'leadership', bonus: 7 },
                { key: 'che_명마_10_대완마', stat: 'leadership', bonus: 10 },
                { key: 'che_서적_01_효경전', stat: 'intelligence', bonus: 1 },
                { key: 'che_서적_07_논어', stat: 'intelligence', bonus: 7 },
                { key: 'che_서적_10_구국론', stat: 'intelligence', bonus: 10 },
            ];

        for (const { key, stat, bonus } of statTestCases) {
            it(`should apply ${stat} +${bonus} for ${key}`, async () => {
                const module = await loader.load(key);
                const general = createMockGeneral();
                const context = createMockGeneralActionContext(general);

                expect(module.onCalcStat).toBeDefined();
                const result = module.onCalcStat!(context, stat, 50);
                expect(result).toBe(50 + bonus);
            });
        }
    });
});

describe('Item Effects - onCalcOpposeStat', () => {
    let loader: ItemLoader;

    beforeEach(() => {
        loader = new ItemLoader();
    });

    it('che_반계_백우선 should reduce opponent magic success probability', async () => {
        const module = await loader.load('che_반계_백우선');
        const general = createMockGeneral();
        const context = createMockGeneralActionContext(general);

        expect(module.onCalcOpposeStat).toBeDefined();

        // warMagicSuccessProb 감소 테스트 - 직접 호출 (내부 구현은 WarStatName도 받음)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (module.onCalcOpposeStat as any)(context, 'warMagicSuccessProb', 0.5);
        expect(result).toBe(0.4); // 0.5 - 0.1
    });

    it('che_반계_백우선 should not affect non-magic stats', async () => {
        const module = await loader.load('che_반계_백우선');
        const general = createMockGeneral();
        const context = createMockGeneralActionContext(general);

        // 다른 스탯은 영향 없음
        const strength = module.onCalcOpposeStat!(context, 'strength', 50);
        expect(strength).toBe(50);
    });
});

describe('Item Effects - getBattlePhaseTriggerList', () => {
    let loader: ItemLoader;

    beforeEach(() => {
        loader = new ItemLoader();
    });

    it('che_반계_백우선 should return war triggers', async () => {
        const module = await loader.load('che_반계_백우선');
        expect(module.getBattlePhaseTriggerList).toBeDefined();
    });

    it('che_위압_조목삭 should return war triggers', async () => {
        const module = await loader.load('che_위압_조목삭');
        expect(module.getBattlePhaseTriggerList).toBeDefined();
    });

    it('che_반계_파초선 should return war triggers', async () => {
        const module = await loader.load('che_반계_파초선');
        expect(module.getBattlePhaseTriggerList).toBeDefined();
    });

    it('stat-only items should not have battle triggers', async () => {
        const module = await loader.load('che_무기_15_의천검');
        expect(module.getBattlePhaseTriggerList).toBeUndefined();
    });
});

describe('Item Module Structure Validation', () => {
    let loader: ItemLoader;

    beforeEach(() => {
        loader = new ItemLoader();
    });

    describe('Special effect items', () => {
        const specialItems: ItemKey[] = [
            'che_반계_백우선',
            'che_반계_파초선',
            'che_위압_조목삭',
            'che_저격_매화수전',
            'che_저격_비도',
            'che_저격_수극',
            'che_필살_둔갑천서',
            'che_회피_태평요술',
        ];

        for (const key of specialItems) {
            it(`${key} should have battle triggers or special effects`, async () => {
                const module = await loader.load(key);
                const hasBattleTriggers =
                    module.getBattlePhaseTriggerList !== undefined || module.getBattleInitTriggerList !== undefined;
                const hasStatEffects = module.onCalcStat !== undefined || module.onCalcOpposeStat !== undefined;
                const hasWarPowerMultiplier = module.getWarPowerMultiplier !== undefined;

                expect(hasBattleTriggers || hasStatEffects || hasWarPowerMultiplier).toBe(true);
            });
        }
    });

    describe('Item slot assignments', () => {
        it('weapon items should have weapon slot', async () => {
            const weaponKeys = ['che_무기_01_단도', 'che_무기_07_동추', 'che_무기_15_의천검'] satisfies ItemKey[];

            for (const key of weaponKeys) {
                const module = await loader.load(key);
                expect(module.slot).toBe('weapon');
            }
        });

        it('horse items should have horse slot', async () => {
            const horseKeys = ['che_명마_01_노기', 'che_명마_07_기주마', 'che_명마_15_적토마'] satisfies ItemKey[];

            for (const key of horseKeys) {
                const module = await loader.load(key);
                expect(module.slot).toBe('horse');
            }
        });

        it('book items should have book slot', async () => {
            const bookKeys = ['che_서적_01_효경전', 'che_서적_07_논어', 'che_서적_15_손자병법'] satisfies ItemKey[];

            for (const key of bookKeys) {
                const module = await loader.load(key);
                expect(module.slot).toBe('book');
            }
        });

        it('special items should have item slot', async () => {
            const itemKeys = ['che_반계_백우선', 'che_위압_조목삭', 'che_보물_도기'] satisfies ItemKey[];

            for (const key of itemKeys) {
                const module = await loader.load(key);
                expect(module.slot).toBe('item');
            }
        });
    });
});

describe('ItemModuleRegistry Integration', () => {
    it('should create registry with loaded modules', async () => {
        const keys: ItemKey[] = ['che_무기_15_의천검', 'che_명마_15_적토마', 'che_서적_15_손자병법'];

        const modules = await loadItemModules(keys);
        const registry = createItemModuleRegistry(modules);

        expect(registry.size).toBe(3);

        for (const key of keys) {
            const module = registry.get(key);
            expect(module).toBeDefined();
            expect(module!.key).toBe(key);
        }
    });

    it('should allow querying modules by key', async () => {
        const keys: ItemKey[] = ['che_반계_백우선', 'che_위압_조목삭'];

        const modules = await loadItemModules(keys);
        const registry = createItemModuleRegistry(modules);

        const 백우선 = registry.get('che_반계_백우선');
        expect(백우선).toBeDefined();
        expect(백우선!.name).toContain('백우선');

        const 조목삭 = registry.get('che_위압_조목삭');
        expect(조목삭).toBeDefined();
        expect(조목삭!.name).toContain('조목삭');
    });
});
