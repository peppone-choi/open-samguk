import { describe, it, expect } from 'vitest';
import { LiteHashDRBG, RandUtil } from '@sammo-ts/common';
import { WorldSnapshot } from '../entities.js';
import { GeneralReinforceSecurityCommand } from './GeneralReinforceSecurityCommand.js';

describe('GeneralReinforceSecurityCommand (TDD)', () => {
  const seed = 'test-seed';
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: '유비',
        nationId: 1,
        cityId: 1,
        gold: 1000,
        rice: 1000,
        leadership: 7,
        leadershipExp: 0,
        strength: 7,
        strengthExp: 0,
        intel: 7,
        intelExp: 0,
        politics: 8,
        politicsExp: 0,
        charm: 8,
        charmExp: 0,
        injury: 0,
        experience: 0,
        dedication: 0,
        crew: 0,
        crewType: 0,
        train: 0,
        atmos: 0,
        age: 20,
        special: 'None',
        specAge: 0,
        special2: 'None',
        specAge2: 0,
        turnTime: new Date(),
        killTurn: 10,
        meta: {},
      },
    },
    nations: {},
    cities: {
      1: {
        id: 1,
        name: '평원',
        nationId: 1,
        pop: 10000,
        agri: 100,
        comm: 100,
        secu: 100,
        def: 100,
        wall: 100,
        meta: {},
      }
    },
    gameTime: { year: 184, month: 1 },
  };

  it('치안 강화 시 도시의 치안 수치가 증가하고 장수의 무력 경험치가 올라야 함', () => {
    const cmd = new GeneralReinforceSecurityCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {});

    // 도시 치안 증가 확인
    expect(delta.cities?.[1]?.secu).toBeGreaterThan(100);
    // 장수 무력 경험치 증가 확인
    expect(delta.generals?.[1]?.strengthExp).toBe(1);
    // 로그 확인
    expect(delta.logs?.general?.[1][0]).toContain('치안을 강화하여');
  });
});
