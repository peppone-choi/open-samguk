import { describe, it, expect } from 'vitest';
import { LiteHashDRBG, RandUtil } from '@sammo-ts/common';
import { WorldSnapshot } from '../entities.js';
import { GeneralFireAttackCommand } from './GeneralFireAttackCommand.js';

describe('GeneralFireAttackCommand', () => {
  const seed = 'test-fire-seed';
  const rng = new LiteHashDRBG(seed);
  const rand = new RandUtil(rng);

  const mockSnapshot: WorldSnapshot = {
    generals: {
      1: {
        id: 1,
        name: '제갈량',
        nationId: 1,
        cityId: 1, // 업
        gold: 10000,
        rice: 10000,
        leadership: 50,
        leadershipExp: 0,
        strength: 50,
        strengthExp: 0,
        intel: 100,
        intelExp: 0,
        politics: 50,
        politicsExp: 0,
        charm: 50,
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
        killTurn: 0,
        meta: {},
        penalty: {},
        officerLevel: 0, officerCity: 0, ownerId: 0, bornYear: 0, deadYear: 0, weapon: '', book: '', horse: '', item: '', recentWarTime: null, makeLimit: 0, block: 0, recentWar: 0,
      },
      2: {
        id: 2,
        name: '바보',
        nationId: 2, // 적국
        cityId: 2, // 허창
        gold: 0, rice: 0,
        intel: 10, intelExp: 0,
        leadership: 50, leadershipExp: 0, strength: 50, strengthExp: 0, politics: 50, politicsExp: 0, charm: 50, charmExp: 0, injury: 0, experience: 0, dedication: 0, crew: 0, crewType: 0, train: 0, atmos: 0, age: 20, special: 'None', specAge: 0, special2: 'None', specAge2: 0, turnTime: new Date(), killTurn: 0, meta: {}, penalty: {},
        officerLevel: 0, officerCity: 0, ownerId: 0, bornYear: 0, deadYear: 0, weapon: '', book: '', horse: '', item: '', recentWarTime: null, makeLimit: 0, block: 0, recentWar: 0,
      }
    },
    nations: {
      1: { id: 1, name: '촉', color: '', capitalCityId: 1, gold: 0, rice: 0, bill: 0, rate: 0, rateTmp: 0, secretLimit: 0, chiefGeneralId: 1, scoutLevel: 0, warState: 0, strategicCmdLimit: 0, surrenderLimit: 0, tech: 0, power: 0, level: 0, typeCode: '', spy: {}, meta: {} },
      2: { id: 2, name: '위', color: '', capitalCityId: 2, gold: 0, rice: 0, bill: 0, rate: 0, rateTmp: 0, secretLimit: 0, chiefGeneralId: 2, scoutLevel: 0, warState: 0, strategicCmdLimit: 0, surrenderLimit: 0, tech: 0, power: 0, level: 0, typeCode: '', spy: {}, meta: {} },
    },
    cities: {
      1: { id: 1, name: '업', nationId: 1, supply: 1, pop: 1000, popMax: 1000, agri: 1000, agriMax: 1000, comm: 1000, commMax: 1000, secu: 100, secuMax: 100, def: 100, defMax: 100, wall: 100, wallMax: 100, trust: 100, gold: 0, rice: 0, region: 1, state: 0, term: 0, conflict: {}, meta: {}, level: 1, front: 0 },
      2: { id: 2, name: '허창', nationId: 2, supply: 1, pop: 1000, popMax: 1000, agri: 1000, agriMax: 1000, comm: 1000, commMax: 1000, secu: 100, secuMax: 100, def: 100, defMax: 100, wall: 100, wallMax: 100, trust: 100, gold: 0, rice: 0, region: 1, state: 0, term: 0, conflict: {}, meta: {}, level: 1, front: 0 },
    },
    diplomacy: {},
    troops: {},
    gameTime: { year: 184, month: 1 },
    env: { develcost: 20 },
  };

  it('거리 5 이내의 적국 도시에 화계를 성공해야 함', () => {
    const cmd = new GeneralFireAttackCommand();
    // 업(1) -> 허창(2). MapData상 거리 2.
    
    const delta = cmd.run(rand, mockSnapshot, 1, { destCityId: 2 });
    
    expect(delta.generals?.[1]?.gold).toBeLessThan(10000);
    
    const logs = delta.logs?.general?.[1] || [];
    const isSuccess = logs.some(l => l.includes('성공'));
    const isFail = logs.some(l => l.includes('실패'));
    
    expect(isSuccess || isFail).toBe(true);
    
    if (isSuccess) {
       // 성공 시 농업 감소 확인
       expect(delta.cities?.[2]?.agri).toBeLessThan(1000);
    }
  });

  it('자금이 부족하면 실패해야 함', () => {
    // Deep copy
    const poorSnapshot: WorldSnapshot = JSON.parse(JSON.stringify(mockSnapshot));
    poorSnapshot.generals[1].gold = 0;
    // 날짜 객체 복구
    poorSnapshot.generals[1].turnTime = new Date();
    poorSnapshot.generals[2].turnTime = new Date();
    
    const cmd = new GeneralFireAttackCommand();
    const delta = cmd.run(rand, poorSnapshot, 1, { destCityId: 2 });
    
    expect(delta.logs?.general?.[1][0]).toContain('자금이 부족합니다');
  });
});
