import { describe, it, expect } from 'vitest';
import { LiteHashDRBG } from './LiteHashDRBG.js';

    describe('LiteHashDRBG', () => {
        it('should be deterministic with the same seed', () => {
            const rng1 = new LiteHashDRBG('test-seed');
            const rng2 = new LiteHashDRBG('test-seed');

            for (let i = 0; i < 100; i++) {
                expect(rng1.nextFloat1()).toBe(rng2.nextFloat1());
            }
        });

        it('should be different with different seeds', () => {
            const rng1 = new LiteHashDRBG('seed-1');
            const rng2 = new LiteHashDRBG('seed-2');

            expect(rng1.nextFloat1()).not.toBe(rng2.nextFloat1());
        });

        it('should generate values within range [0, 1]', () => {
            const rng = new LiteHashDRBG('range-test');
            for (let i = 0; i < 1000; i++) {
                const val = rng.nextFloat1();
                expect(val).toBeGreaterThanOrEqual(0);
                expect(val).toBeLessThanOrEqual(1);
            }
        });
    });