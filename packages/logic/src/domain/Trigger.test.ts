import { describe, it, expect, vi } from 'vitest';
import { TriggerRegistry, Trigger, TriggerContext } from './Trigger.js';
import { LiteHashDRBG, RandUtil } from '@sammo-ts/common';

describe('Trigger System (TDD)', () => {
  it('트리거는 우선순위에 따라 실행되어야 함', () => {
    const registry = new TriggerRegistry();
    const results: string[] = [];

    const t1: Trigger = {
      name: 'Late',
      priority: 100,
      attempt: () => true,
      execute: () => { results.push('Late'); return {}; }
    };

    const t2: Trigger = {
      name: 'Early',
      priority: 10,
      attempt: () => true,
      execute: () => { results.push('Early'); return {}; }
    };

    registry.register(t1);
    registry.register(t2);

    const ctx: TriggerContext = {
      actorId: 1,
      snapshot: { generals: {}, nations: {}, cities: {}, gameTime: { year: 1, month: 1 } },
      rand: new RandUtil(new LiteHashDRBG('test'))
    };

    registry.runAll(ctx);

    expect(results).toEqual(['Early', 'Late']);
  });

  it('attempt가 false를 반환하면 execute는 실행되지 않아야 함', () => {
    const registry = new TriggerRegistry();
    const executeSpy = vi.fn();

    const t: Trigger = {
      name: 'FailedAttempt',
      priority: 1,
      attempt: () => false,
      execute: executeSpy
    };

    registry.register(t);
    registry.runAll({} as any);

    expect(executeSpy).not.toHaveBeenCalled();
  });
});
