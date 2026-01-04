import { describe, it, expect } from 'vitest';
import { RandUtil } from '@sammo-ts/common';
import { GeneralDraftCommand } from '../../src/domain/commands/GeneralDraftCommand.js';
import { WorldSnapshot } from '../../src/domain/entities.js';

describe('GeneralDraftCommand', () => {
  const rng = new RandUtil('test');

  const baseSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: '유비',
        nationId: 1,
        cityId: 1,
        gold: 2000,
        rice: 1000,
        leadership: 80,
        leadershipExp: 0,
        strength: 70,
        strengthExp: 0,
        intel: 80,
        intelExp: 0,
        politics: 80,
        politicsExp: 0,
        charm: 90,
        charmExp: 0,
        injury: 0,
        experience: 1000,
        dedication: 1000,
        crew: 1000,
        crewType: 1,
        train: 80,
        atmos: 80,
        age: 30,
        special: 'None',
        specAge: 0,
        special2: 'None',
        specAge2: 0,
        turnTime: new Date(),
        killTurn: 0,
        meta: {},
      },
    },
    nations: {
      1: {
        id: 1,
        name: '촉',
        color: '#ff0000',
        capitalCityId: 1,
        gold: 10000,
        rice: 10000,
        tech: 100,
        power: 1000,
        level: 1,
        typeCode: 'normal',
        meta: {},
      },
    },
    cities: {
      1: {
        id: 1,
        name: '성도',
        nationId: 1,
        pop: 100000,
        agri: 500,
        comm: 500,
        secu: 100,
        def: 500,
        wall: 500,
        meta: {},
      },
    },
    gameTime: { year: 184, month: 1 },
  };

  it('모병을 수행하면 병사가 늘어나고 금이 감소하며 도시 인구와 치안이 감소한다', () => {
    const command = new GeneralDraftCommand();
    const delta = command.run(rng, baseSnapshot, 1, {});

    expect(delta.generals?.[1].crew).toBeGreaterThan(1000);
    expect(delta.generals?.[1].gold).toBe(1000); // 2000 - 1000
    expect(delta.cities?.[1].pop).toBeLessThan(100000);
    expect(delta.cities?.[1].secu).toBe(95); // 100 - 5
    expect(delta.generals?.[1].train).toBeLessThan(80); // 희석 효과
    expect(delta.generals?.[1].atmos).toBeLessThan(80); // 희석 효과
  });

  it('금이 부족하면 모병에 실패한다', () => {
    const poorSnapshot = JSON.parse(JSON.stringify(baseSnapshot));
    poorSnapshot.generals[1].gold = 500;

    const command = new GeneralDraftCommand();
    const delta = command.run(rng, poorSnapshot, 1, {});

    expect(delta.logs?.general?.[1][0]).toContain('실패');
    expect(delta.generals).toBeUndefined();
  });
});
