import { describe, it, expect } from 'vitest';
import { LiteHashDRBG, RandUtil } from '@sammo-ts/common';
import { WorldSnapshot } from '../entities.js';
import { GeneralFoundNationCommand } from './GeneralFoundNationCommand.js';

describe('GeneralFoundNationCommand', () => {
  const seed = 'test-found-seed';
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1, name: '유비', nationId: 1, cityId: 1,
        gold: 1000, rice: 1000, intel: 80, leadership: 80, strength: 80, politics: 80, charm: 99,
        officerLevel: 12, officerCity: 0,
        experience: 0, dedication: 0,
        turnTime: new Date(), killTurn: 0, meta: {}, penalty: {},
        leadershipExp: 0, strengthExp: 0, intelExp: 0, politicsExp: 0, charmExp: 0, injury: 0, crew: 0, crewType: 0, train: 0, atmos: 0, age: 20, special: 'None', specAge: 0, special2: 'None', specAge2: 0, recentWar: 0, block: 0, ownerId: 0, bornYear: 0, deadYear: 0, weapon: '', book: '', horse: '', item: '', recentWarTime: null, makeLimit: 0,
      },
      2: {
        id: 2, name: '관우', nationId: 1, cityId: 1,
        gold: 0, rice: 0, intel: 0, leadership: 0, strength: 0, politics: 0, charm: 0,
        experience: 0, dedication: 0,
        turnTime: new Date(), killTurn: 0, meta: {}, penalty: {},
        leadershipExp: 0, strengthExp: 0, intelExp: 0, politicsExp: 0, charmExp: 0, injury: 0, crew: 0, crewType: 0, train: 0, atmos: 0, age: 20, special: 'None', specAge: 0, special2: 'None', specAge2: 0, recentWar: 0, block: 0, officerLevel: 0, officerCity: 0, ownerId: 0, bornYear: 0, deadYear: 0, weapon: '', book: '', horse: '', item: '', recentWarTime: null, makeLimit: 0,
      }
    },
    nations: {
      1: { id: 1, name: '유비군', level: 0, chiefGeneralId: 1, color: '#FFF', capitalCityId: 0, gold: 0, rice: 0, bill: 0, rate: 0, rateTmp: 0, secretLimit: 0, scoutLevel: 0, warState: 0, strategicCmdLimit: 0, surrenderLimit: 0, tech: 0, power: 0, typeCode: 'che_중립', gennum: 2, spy: {}, meta: {} },
    },
    cities: {
      1: { id: 1, name: '평원', nationId: 1, level: 5, supply: 1, pop: 1000, popMax: 1000, agri: 1000, agriMax: 1000, comm: 1000, commMax: 1000, secu: 100, secuMax: 100, def: 100, defMax: 100, wall: 100, wallMax: 100, trust: 100, gold: 0, rice: 0, region: 1, state: 0, term: 0, conflict: {}, meta: {}, front: 0 },
    },
    diplomacy: {}, troops: {}, gameTime: { year: 184, month: 1 }, env: {},
  };

  it('방랑군 군주가 건국을 실행하면 국가가 정식 국가가 되어야 함', () => {
    const cmd = new GeneralFoundNationCommand();
    const delta = cmd.run(rand, mockSnapshot, 1, {
        nationName: '촉한',
        color: '#F00',
        nationType: 'che_덕가'
    });

    expect(delta.nations?.[1]?.name).toBe('촉한');
    expect(delta.nations?.[1]?.level).toBe(1);
    expect(delta.logs?.global?.[0]).toContain('건설하였습니다');
  });

  it('장수가 1명이면 건국할 수 없음', () => {
    // 장수 제거
    const soloSnapshot: WorldSnapshot = JSON.parse(JSON.stringify(mockSnapshot));
    // mockSnapshot.generals[2] exists.
    // Need to handle Date object parse if using JSON.stringify
    soloSnapshot.generals[1].turnTime = new Date();
    // Delete general 2
    delete soloSnapshot.generals[2];
    soloSnapshot.nations[1].gennum = 1;

    const cmd = new GeneralFoundNationCommand();
    const delta = cmd.run(rand, soloSnapshot, 1, {
        nationName: '실패국',
        color: '#F00',
        nationType: 'che_덕가'
    });

    expect(delta.logs?.general?.[1][0]).toContain('장수 수가 부족합니다');
  });

  it('이미 정식 국가이면 실패해야 함', () => {
    const formalSnapshot: WorldSnapshot = JSON.parse(JSON.stringify(mockSnapshot));
    formalSnapshot.generals[1].turnTime = new Date();
    formalSnapshot.generals[2].turnTime = new Date();
    formalSnapshot.nations[1].level = 1;

    const cmd = new GeneralFoundNationCommand();
    const delta = cmd.run(rand, formalSnapshot, 1, {
        nationName: '실패국',
        color: '#F00',
        nationType: 'che_덕가'
    });

    expect(delta.logs?.general?.[1][0]).toContain('방랑군 상태여야 합니다');
  });
});
