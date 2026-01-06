# 웹 세션 3: 국가 커맨드 구현

## 프로젝트 개요
삼국지 모의전투 게임의 레거시 PHP 코드를 TypeScript로 포팅하는 프로젝트입니다.

## 이 세션의 목표
미구현 국가 커맨드 20개 구현

## 작업 환경
- 레거시: `legacy/hwe/sammo/Command/Nation/` (PHP)
- 구현 위치: `packages/logic/src/domain/commands/` (TypeScript)
- 기존 구현 참조: `NationDeclareWarCommand.ts`, `NationRewardCommand.ts`

## 이미 구현된 국가 커맨드 (18개)
- NationRestCommand, NationRewardCommand, NationConfiscateCommand
- NationChangeCapitalCommand, NationChangeColorCommand, NationChangeNameCommand
- NationDeclareWarCommand, NationProposeNonAggressionCommand
- NationAcceptNonAggressionCommand, NationProposePeaceCommand
- NationAcceptPeaceCommand, NationExpandCapitalCommand
- NationReduceCapitalCommand, NationAppointCommand
- NationAidCommand, NationAdjustTaxCommand
- NationProposeAllianceCommand, NationAcceptAllianceCommand

## 구현할 국가 커맨드 (20개)

### 전략 커맨드 (6개)
```
1. che_급습.php → NationRaidCommand.ts
   - 적 도시 급습, 자원 약탈
   - 조건: 전쟁 상태, 인접 도시

2. che_수몰.php → NationFloodCommand.ts
   - 도시 수몰 공격 (농업/인구 피해)
   - 조건: 하천 인접 도시

3. che_초토화.php → NationScorchedEarthCommand.ts
   - 자국 도시 초토화 (적 진군 방해)
   - 조건: 자국 도시

4. che_허보.php → NationFalseNewsCommand.ts
   - 허위 정보 유포 (적 민심 감소)
   - 조건: 전쟁 상태

5. che_피장파장.php → NationRetaliationCommand.ts
   - 보복 전략 (공격받은 만큼 반격)
   - 조건: 최근 피해 기록

6. che_필사즉생.php → NationDesperateCommand.ts
   - 결사 항전 (전투력 증가, 퇴각 불가)
   - 조건: 수도 위협 상태
```

### 내정 커맨드 (4개)
```
7. che_백성동원.php → NationMobilizeCommand.ts
   - 백성 동원 (긴급 병력 확보)
   - 조건: 인구 여유

8. che_의병모집.php → NationRecruitMilitiaCommand.ts
   - 의병 모집 (충성도 기반 병력)
   - 조건: 민심 70 이상

9. che_이호경식.php → NationEconomicWarfareCommand.ts
   - 경제 전쟁 (적 상업 피해)
   - 조건: 전쟁 상태

10. cr_인구이동.php → NationMigratePopulationCommand.ts
    - 인구 이동 (도시 간 인구 재배치)
    - 조건: 자국 도시 2개 이상
```

### 외교 커맨드 (3개)
```
11. che_불가침파기제의.php → NationBreakNonAggressionCommand.ts
    - 불가침 파기 제의
    - 조건: 불가침 상태

12. che_불가침파기수락.php → NationAcceptBreakNonAggressionCommand.ts
    - 불가침 파기 수락
    - 조건: 파기 제의 수신

13. che_무작위수도이전.php → NationRandomCapitalCommand.ts
    - 무작위 수도 이전 (긴급 천도)
    - 조건: 자국 도시 존재
```

### 부대 관리 (1개)
```
14. che_부대탈퇴지시.php → NationExpelFromTroopCommand.ts
    - 부대 강제 탈퇴
    - 조건: 군주/태수 권한
```

### 연구 커맨드 (9개)
```
15. event_극병연구.php → NationResearchPikemanCommand.ts
16. event_대검병연구.php → NationResearchSwordCommand.ts
17. event_무희연구.php → NationResearchDancerCommand.ts
18. event_산저병연구.php → NationResearchMountainCommand.ts
19. event_상병연구.php → NationResearchMerchantCommand.ts
20. event_원융노병연구.php → NationResearchCrossbowCommand.ts
    - 특수 병종 연구 (기술/자원 필요)
```

## 구현 템플릿

```typescript
// packages/logic/src/domain/commands/NationRaidCommand.ts
import { RandUtil } from '@sammo-ts/common';
import { WorldSnapshot, Nation, City, General } from '../entities.js';
import { CommandDelta } from './types.js';

export interface RaidCommandArgs {
  targetCityId: number;
}

export class NationRaidCommand {
  readonly id = 'nation_raid';
  readonly name = '급습';

  // 제약 조건
  checkConstraints(
    snapshot: WorldSnapshot,
    generalId: number,
    args: RaidCommandArgs
  ): { valid: boolean; reason?: string } {
    const general = snapshot.generals[generalId];
    const nation = snapshot.nations[general.nationId];
    const targetCity = snapshot.cities[args.targetCityId];

    if (!targetCity) {
      return { valid: false, reason: '대상 도시를 찾을 수 없습니다.' };
    }

    if (targetCity.nationId === nation.id) {
      return { valid: false, reason: '자국 도시는 급습할 수 없습니다.' };
    }

    // 전쟁 상태 확인
    const diplomacyKey = `${nation.id}:${targetCity.nationId}`;
    const diplomacy = snapshot.diplomacy[diplomacyKey];
    if (!diplomacy || diplomacy.state !== '0') {
      return { valid: false, reason: '전쟁 중인 국가만 급습할 수 있습니다.' };
    }

    return { valid: true };
  }

  run(
    rand: RandUtil,
    snapshot: WorldSnapshot,
    generalId: number,
    args: RaidCommandArgs
  ): CommandDelta {
    const general = snapshot.generals[generalId];
    const nation = snapshot.nations[general.nationId];
    const targetCity = snapshot.cities[args.targetCityId];

    // 급습 성공률 계산
    const baseSuccess = 0.3 + (general.intel / 200);
    const success = rand.nextFloat() < baseSuccess;

    if (!success) {
      return {
        logs: {
          general: {
            [generalId]: [`${targetCity.name} 급습에 실패했습니다.`],
          },
          nation: {
            [nation.id]: [`${general.name}의 급습이 실패했습니다.`],
          },
        },
      };
    }

    // 급습 성공 - 자원 약탈
    const lootGold = Math.floor(targetCity.gold * 0.3);
    const lootRice = Math.floor(targetCity.rice * 0.3);

    return {
      cities: {
        [targetCity.id]: {
          gold: targetCity.gold - lootGold,
          rice: targetCity.rice - lootRice,
        },
      },
      nations: {
        [nation.id]: {
          gold: nation.gold + lootGold,
          rice: nation.rice + lootRice,
        },
      },
      logs: {
        general: {
          [generalId]: [
            `${targetCity.name} 급습 성공! 금 ${lootGold}, 쌀 ${lootRice} 획득`,
          ],
        },
        nation: {
          [nation.id]: [
            `${general.name}이(가) ${targetCity.name}을(를) 급습하여 자원을 약탈했습니다.`,
          ],
        },
        nation: {
          [targetCity.nationId]: [
            `${targetCity.name}이(가) 적의 급습을 받았습니다!`,
          ],
        },
      },
    };
  }
}
```

## 테스트 템플릿

```typescript
// packages/logic/src/domain/commands/NationRaidCommand.test.ts
import { describe, it, expect } from 'vitest';
import { LiteHashDRBG, RandUtil } from '@sammo-ts/common';
import { NationRaidCommand } from './NationRaidCommand.js';
import { WorldSnapshot } from '../entities.js';

describe('NationRaidCommand', () => {
  const createSnapshot = (): WorldSnapshot => ({
    generals: {
      1: {
        id: 1, name: '장수', nationId: 1, intel: 80,
        officerLevel: 12, // 군주
      },
    },
    nations: {
      1: { id: 1, name: '촉', gold: 10000, rice: 10000 },
      2: { id: 2, name: '위', gold: 20000, rice: 20000 },
    },
    cities: {
      1: { id: 1, nationId: 1, gold: 5000, rice: 5000 },
      2: { id: 2, nationId: 2, gold: 8000, rice: 8000 },
    },
    diplomacy: {
      '1:2': { state: '0', term: 12 }, // 전쟁 상태
    },
    troops: {},
    messages: {},
    gameTime: { year: 200, month: 1 },
    env: {},
  });

  it('should validate war state requirement', () => {
    const cmd = new NationRaidCommand();
    const snapshot = createSnapshot();
    snapshot.diplomacy = {}; // 평화 상태

    const result = cmd.checkConstraints(snapshot, 1, { targetCityId: 2 });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('전쟁');
  });

  it('should loot resources on success', () => {
    const cmd = new NationRaidCommand();
    const snapshot = createSnapshot();
    const rng = new LiteHashDRBG('success-seed');
    const rand = new RandUtil(rng);

    // Mock success
    const delta = cmd.run(rand, snapshot, 1, { targetCityId: 2 });

    // 성공 시 자원 변화 확인
    if (delta.cities?.[2]) {
      expect(delta.cities[2].gold).toBeLessThan(8000);
    }
  });
});
```

## 진행 체크리스트

전략 커맨드:
- [ ] NationRaidCommand + test
- [ ] NationFloodCommand + test
- [ ] NationScorchedEarthCommand + test
- [ ] NationFalseNewsCommand + test
- [ ] NationRetaliationCommand + test
- [ ] NationDesperateCommand + test

내정 커맨드:
- [ ] NationMobilizeCommand + test
- [ ] NationRecruitMilitiaCommand + test
- [ ] NationEconomicWarfareCommand + test
- [ ] NationMigratePopulationCommand + test

외교 커맨드:
- [ ] NationBreakNonAggressionCommand + test
- [ ] NationAcceptBreakNonAggressionCommand + test
- [ ] NationRandomCapitalCommand + test

기타:
- [ ] NationExpelFromTroopCommand + test
- [ ] NationResearchPikemanCommand + test
- [ ] NationResearchSwordCommand + test
- [ ] ... (나머지 연구 커맨드)

## 완료 기준
- 20개 국가 커맨드 구현
- 각 커맨드에 최소 3개 테스트 (성공, 실패, 조건 검증)
- `pnpm --filter @sammo-ts/logic test` 통과
