import { describe, it, expect } from 'vitest';
import { LiteHashDRBG, RandUtil } from '@sammo-ts/common';
import { WorldSnapshot } from '../entities.js';
import { GeneralDonateCommand } from './GeneralDonateCommand.js';

describe('GeneralDonateCommand', () => {
  const seed = 'test-donate-seed';
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1, name: '장수1', nationId: 1, cityId: 1, gold: 5000, rice: 5000,
        leadership: 50, leadershipExp: 0, strength: 50, strengthExp: 0, intel: 50, intelExp: 0, politics: 50, politicsExp: 0, charm: 50, charmExp: 0,
        injury: 0, experience: 1000, dedication: 1000, crew: 0, crewType: 0, train: 0, atmos: 0, age: 20, turnTime: new Date(),
        killTurn: 0, meta: {}, penalty: {}, officerLevel: 1, officerCity: 1, ownerId: 1, bornYear: 180, deadYear: 280,
        weapon: '', book: '', horse: '', item: '', recentWarTime: null, makeLimit: 0, block: 0, recentWar: 0,
        dex: {}, special: '', specAge: 0, special2: '', specAge2: 0, defenceTrain: 80, tournamentState: 0, lastTurn: {}
      }
    },
    nations: {
      1: { id: 1, name: '국가1', color: '#FF0000', capitalCityId: 1, gold: 10000, rice: 10000, rate: 10, rateTmp: 10, tech: 0, power: 1000, level: 1, gennum: 1, typeCode: 'che_중립', scoutLevel: 0, warState: 0, strategicCmdLimit: 36, surrenderLimit: 72, spy: {}, meta: {}, chiefGeneralId: 1 }
    },
    cities: {
      1: { id: 1, name: '도시1', nationId: 1, supply: 1, pop: 10000, popMax: 10000, agri: 5000, agriMax: 10000, comm: 5000, commMax: 10000, secu: 100, secuMax: 100, def: 1000, defMax: 1000, wall: 1000, wallMax: 1000, trust: 100, gold: 0, rice: 0, region: 1, state: 0, term: 0, conflict: {}, meta: {}, level: 5, front: 0 }
    },
    diplomacy: {},
    troops: {},
    gameTime: { year: 184, month: 1 },
    env: {}
  };

  it('금 1000을 헌납해야 함', () => {
    const cmd = new GeneralDonateCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, { isGold: true, amount: 1000 });

    expect(delta.generals?.[1]?.gold).toBe(4000);
    expect(delta.nations?.[1]?.gold).toBe(11000);
    expect(delta.generals?.[1]?.experience).toBe(mockSnapshot.generals[1].experience + 70);
    expect(delta.generals?.[1]?.dedication).toBe(mockSnapshot.generals[1].dedication + 100);
    expect(delta.generals?.[1]?.leadershipExp).toBe(mockSnapshot.generals[1].leadershipExp + 1);
    expect(delta.logs?.general?.[1]?.[0]).toContain('금 1,000을 헌납했습니다.');
  });

  it('보유한 금보다 많이 헌납하려 하면 전액 헌납해야 함', () => {
    const cmd = new GeneralDonateCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, { isGold: true, amount: 10000 });

    expect(delta.generals?.[1]?.gold).toBe(0);
    expect(delta.nations?.[1]?.gold).toBe(15000);
    expect(delta.logs?.general?.[1]?.[0]).toContain('금 5,000을 헌납했습니다.');
  });

  it('쌀 2000을 헌납해야 함', () => {
    const cmd = new GeneralDonateCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, { isGold: false, amount: 2000 });

    expect(delta.generals?.[1]?.rice).toBe(3000);
    expect(delta.nations?.[1]?.rice).toBe(12000);
    expect(delta.logs?.general?.[1]?.[0]).toContain('쌀 2,000을 헌납했습니다.');
  });
});
