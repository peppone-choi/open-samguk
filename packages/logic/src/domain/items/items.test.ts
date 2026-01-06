import { describe, it, expect, beforeEach } from 'vitest';
import {
    getItemRegistry,
    ItemRegistry,
    type GeneralReadOnly,
    type WarUnitReadOnly,
} from './index.js';
import {
    언월도,
    방천화극,
    의천검,
    청홍검,
    단도,
    청룡언월도,
} from './weapons/index.js';
import {
    적토마,
    한혈마,
    노기,
} from './horses/index.js';
import {
    손자병법,
    노자,
    효경전,
} from './books/index.js';
import {
    GeneralTriggerCaller,
    WarUnitTriggerCaller,
    도시치료Trigger,
    아이템치료Trigger,
    저격시도Trigger,
    저격발동Trigger,
    TriggerType,
} from './triggers/index.js';

/**
 * 테스트용 장수 데이터 생성
 */
function createMockGeneral(overrides: Partial<GeneralReadOnly> = {}): GeneralReadOnly {
    return {
        id: 1,
        name: '관우',
        nationId: 1,
        cityId: 1,
        leadership: 95,
        strength: 99,
        intel: 75,
        special: '',
        special2: '',
        injury: 0,
        crew: 10000,
        crewType: 0,
        train: 100,
        atmos: 100,
        ...overrides,
    };
}

/**
 * 테스트용 전투 유닛 데이터 생성
 */
function createMockWarUnit(overrides: Partial<WarUnitReadOnly> = {}): WarUnitReadOnly {
    return {
        generalId: 1,
        nationId: 1,
        crew: 10000,
        crewType: 0,
        train: 100,
        atmos: 100,
        leadership: 95,
        strength: 99,
        intel: 75,
        ...overrides,
    };
}

describe('아이템 시스템', () => {
    describe('무기 아이템', () => {
        it('언월도는 무력 +14 유니크 아이템이다', () => {
            const item = new 언월도();

            expect(item.rawName).toBe('언월도');
            expect(item.name).toBe('언월도(+14)');
            expect(item.type).toBe('weapon');
            expect(item.rarity).toBe('unique');
            expect(item.buyable).toBe(false);
            expect(item.getStatBonus()).toEqual({ strength: 14 });
        });

        it('청룡언월도는 언월도의 별칭이다', () => {
            const item = new 청룡언월도();
            expect(item.rawName).toBe('언월도');
            expect(item.code).toBe('che_무기_14_언월도');
        });

        it('방천화극은 무력 +14 유니크 아이템이다', () => {
            const item = new 방천화극();

            expect(item.rawName).toBe('방천화극');
            expect(item.name).toBe('방천화극(+14)');
            expect(item.type).toBe('weapon');
            expect(item.rarity).toBe('unique');
            expect(item.getStatBonus()).toEqual({ strength: 14 });
        });

        it('의천검은 무력 +15 유니크 아이템이다', () => {
            const item = new 의천검();
            expect(item.getStatBonus()).toEqual({ strength: 15 });
        });

        it('단도는 무력 +1 일반 아이템이다', () => {
            const item = new 단도();

            expect(item.rawName).toBe('단도');
            expect(item.rarity).toBe('common');
            expect(item.buyable).toBe(true);
            expect(item.cost).toBe(1000);
            expect(item.getStatBonus()).toEqual({ strength: 1 });
        });

        it('onCalcStat으로 무력을 증가시킨다', () => {
            const item = new 언월도();
            const general = createMockGeneral({ strength: 80 });

            const result = item.onCalcStat(general, 'strength', 80);
            expect(result).toBe(94); // 80 + 14
        });

        it('다른 스탯은 변경하지 않는다', () => {
            const item = new 언월도();
            const general = createMockGeneral();

            expect(item.onCalcStat(general, 'leadership', 95)).toBe(95);
            expect(item.onCalcStat(general, 'intel', 75)).toBe(75);
        });
    });

    describe('명마 아이템', () => {
        it('적토마는 통솔 +15 유니크 아이템이다', () => {
            const item = new 적토마();

            expect(item.rawName).toBe('적토마');
            expect(item.type).toBe('horse');
            expect(item.rarity).toBe('unique');
            expect(item.getStatBonus()).toEqual({ leadership: 15 });
        });

        it('노기는 통솔 +1 일반 아이템이다', () => {
            const item = new 노기();

            expect(item.rarity).toBe('common');
            expect(item.buyable).toBe(true);
            expect(item.getStatBonus()).toEqual({ leadership: 1 });
        });

        it('onCalcStat으로 통솔을 증가시킨다', () => {
            const item = new 적토마();
            const general = createMockGeneral({ leadership: 85 });

            const result = item.onCalcStat(general, 'leadership', 85);
            expect(result).toBe(100); // 85 + 15
        });
    });

    describe('서적 아이템', () => {
        it('손자병법은 지력 +15 유니크 아이템이다', () => {
            const item = new 손자병법();

            expect(item.rawName).toBe('손자병법');
            expect(item.type).toBe('book');
            expect(item.rarity).toBe('unique');
            expect(item.getStatBonus()).toEqual({ intel: 15 });
        });

        it('효경전은 지력 +1 일반 아이템이다', () => {
            const item = new 효경전();

            expect(item.rarity).toBe('common');
            expect(item.buyable).toBe(true);
            expect(item.getStatBonus()).toEqual({ intel: 1 });
        });

        it('onCalcStat으로 지력을 증가시킨다', () => {
            const item = new 손자병법();
            const general = createMockGeneral({ intel: 85 });

            const result = item.onCalcStat(general, 'intel', 85);
            expect(result).toBe(100); // 85 + 15
        });
    });

    describe('ItemRegistry', () => {
        let registry: ItemRegistry;

        beforeEach(() => {
            registry = getItemRegistry();
        });

        it('모든 아이템이 등록되어 있다', () => {
            // 무기 26종 + 명마 26종 + 서적 26종 = 78종
            expect(registry.size).toBeGreaterThanOrEqual(78);
        });

        it('코드로 아이템을 생성할 수 있다', () => {
            const weapon = registry.create('che_무기_14_언월도');
            expect(weapon).not.toBeNull();
            expect(weapon!.rawName).toBe('언월도');

            const horse = registry.create('che_명마_15_적토마');
            expect(horse).not.toBeNull();
            expect(horse!.rawName).toBe('적토마');

            const book = registry.create('che_서적_15_손자병법');
            expect(book).not.toBeNull();
            expect(book!.rawName).toBe('손자병법');
        });

        it('존재하지 않는 코드는 null을 반환한다', () => {
            expect(registry.create('invalid_code')).toBeNull();
        });

        it('타입별 아이템을 조회할 수 있다', () => {
            const weaponCodes = registry.getCodesByType('weapon');
            expect(weaponCodes.length).toBeGreaterThanOrEqual(26);
            expect(weaponCodes).toContain('che_무기_14_언월도');

            const horseCodes = registry.getCodesByType('horse');
            expect(horseCodes.length).toBeGreaterThanOrEqual(26);

            const bookCodes = registry.getCodesByType('book');
            expect(bookCodes.length).toBeGreaterThanOrEqual(26);
        });

        it('구매 가능한 아이템을 조회할 수 있다', () => {
            const buyableCodes = registry.getBuyableCodes();
            expect(buyableCodes).toContain('che_무기_01_단도');
            expect(buyableCodes).not.toContain('che_무기_14_언월도');
        });

        it('유니크 아이템을 조회할 수 있다', () => {
            const uniqueCodes = registry.getUniqueCodes();
            expect(uniqueCodes).toContain('che_무기_14_언월도');
            expect(uniqueCodes).toContain('che_명마_15_적토마');
            expect(uniqueCodes).toContain('che_서적_15_손자병법');
            expect(uniqueCodes).not.toContain('che_무기_01_단도');
        });
    });

    describe('트리거 시스템', () => {
        describe('도시치료Trigger', () => {
            it('부상이 있으면 치료를 시도한다', () => {
                const trigger = new 도시치료Trigger();
                const general = createMockGeneral({ injury: 50 });
                const rng = { nextFloat: () => 0.3 }; // 항상 성공

                const result = trigger.execute({ general, rng });
                expect(result.triggered).toBe(true);
            });

            it('부상이 없으면 스킵한다', () => {
                const trigger = new 도시치료Trigger();
                const general = createMockGeneral({ injury: 0 });
                const rng = { nextFloat: () => 0.3 };

                const result = trigger.execute({ general, rng });
                expect(result.triggered).toBe(false);
            });
        });

        describe('아이템치료Trigger', () => {
            it('사용 횟수가 남아있으면 치료한다', () => {
                const trigger = new 아이템치료Trigger(TriggerType.TYPE_ITEM, 3);
                const general = createMockGeneral({ injury: 50 });
                const rng = { nextFloat: () => 0.5 };

                const result = trigger.execute({ general, rng });
                expect(result.triggered).toBe(true);
                expect(trigger.getRemainingUses()).toBe(2);
            });

            it('사용 횟수가 없으면 스킵한다', () => {
                const trigger = new 아이템치료Trigger(TriggerType.TYPE_ITEM, 0);
                const general = createMockGeneral({ injury: 50 });
                const rng = { nextFloat: () => 0.5 };

                const result = trigger.execute({ general, rng });
                expect(result.triggered).toBe(false);
            });
        });

        describe('저격Trigger', () => {
            it('첫 페이즈에서 저격을 시도한다', () => {
                const attemptTrigger = new 저격시도Trigger(TriggerType.TYPE_ITEM, 0.5, 20, 40);
                const unit = createMockWarUnit();
                const rng = { nextFloat: () => 0.3 }; // 0.3 < 0.5 → 성공

                const result = attemptTrigger.execute({ unit, rng, phase: 0 });
                expect(result.triggered).toBe(true);
                expect(result.data?.['atmosBonus']).toBe(20);
            });

            it('첫 페이즈가 아니면 스킵한다', () => {
                const attemptTrigger = new 저격시도Trigger(TriggerType.TYPE_ITEM, 0.5, 20, 40);
                const unit = createMockWarUnit();
                const rng = { nextFloat: () => 0.3 };

                const result = attemptTrigger.execute({ unit, rng, phase: 1 });
                expect(result.triggered).toBe(false);
            });
        });

        describe('GeneralTriggerCaller', () => {
            it('여러 트리거를 순차 실행한다', () => {
                const trigger1 = new 도시치료Trigger(1);
                const trigger2 = new 아이템치료Trigger(2, 3);
                const caller = new GeneralTriggerCaller(trigger1, trigger2);

                const general = createMockGeneral({ injury: 50 });
                const rng = { nextFloat: () => 0.3 };

                const results = caller.executeAll({ general, rng });
                expect(results.length).toBe(2);
            });

            it('중복 ID 트리거는 첫 번째만 실행한다', () => {
                const trigger1 = new 도시치료Trigger(1);
                const trigger2 = new 도시치료Trigger(1); // 같은 ID
                const caller = new GeneralTriggerCaller(trigger1, trigger2);

                const general = createMockGeneral({ injury: 50 });
                const rng = { nextFloat: () => 0.3 };

                const results = caller.executeAll({ general, rng });
                expect(results.length).toBe(1); // 하나만 실행됨
            });
        });

        describe('WarUnitTriggerCaller', () => {
            it('여러 전투 트리거를 순차 실행한다', () => {
                const trigger1 = new 저격시도Trigger(1);
                const trigger2 = new 저격발동Trigger(2);
                const caller = new WarUnitTriggerCaller(trigger1, trigger2);

                const unit = createMockWarUnit();
                const rng = { nextFloat: () => 0.3 };

                const results = caller.executeAll({ unit, rng, phase: 0 });
                expect(results.length).toBe(2);
            });
        });
    });

    describe('레거시 패리티', () => {
        it('무기 레벨별 스탯 증가량이 레거시와 일치한다', () => {
            // 레거시: statValue = 레벨 번호
            const testCases = [
                { code: 'che_무기_01_단도', expected: 1 },
                { code: 'che_무기_07_동추', expected: 7 },
                { code: 'che_무기_14_언월도', expected: 14 },
                { code: 'che_무기_15_의천검', expected: 15 },
            ];

            const registry = getItemRegistry();
            for (const { code, expected } of testCases) {
                const item = registry.create(code);
                expect(item).not.toBeNull();
                expect(item!.getStatBonus().strength).toBe(expected);
            }
        });

        it('명마 레벨별 스탯 증가량이 레거시와 일치한다', () => {
            const testCases = [
                { code: 'che_명마_01_노기', expected: 1 },
                { code: 'che_명마_07_기주마', expected: 7 },
                { code: 'che_명마_14_적란마', expected: 14 },
                { code: 'che_명마_15_적토마', expected: 15 },
            ];

            const registry = getItemRegistry();
            for (const { code, expected } of testCases) {
                const item = registry.create(code);
                expect(item).not.toBeNull();
                expect(item!.getStatBonus().leadership).toBe(expected);
            }
        });

        it('서적 레벨별 스탯 증가량이 레거시와 일치한다', () => {
            const testCases = [
                { code: 'che_서적_01_효경전', expected: 1 },
                { code: 'che_서적_07_논어', expected: 7 },
                { code: 'che_서적_14_오자병법', expected: 14 },
                { code: 'che_서적_15_손자병법', expected: 15 },
            ];

            const registry = getItemRegistry();
            for (const { code, expected } of testCases) {
                const item = registry.create(code);
                expect(item).not.toBeNull();
                expect(item!.getStatBonus().intel).toBe(expected);
            }
        });

        it('유니크 아이템 cost는 200이다 (레거시 일치)', () => {
            const registry = getItemRegistry();
            const uniqueCodes = registry.getUniqueCodes();

            for (const code of uniqueCodes) {
                const item = registry.create(code);
                expect(item).not.toBeNull();
                expect(item!.cost).toBe(200);
            }
        });
    });
});
