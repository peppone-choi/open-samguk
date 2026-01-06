# 국가 커맨드 구현 프롬프트

## 목표
미구현된 국가 커맨드를 TypeScript로 포팅

## 사전 조건
1. 기존 국가 커맨드 패턴 분석 (`NationDeclareWarCommand.ts` 등)
2. 레거시 `legacy/hwe/sammo/Command/Nation/` 분석 완료

## 체크리스트

### Phase 1: 전략 커맨드 (6개)
- [ ] `che_급습.php` → `NationRaidCommand.ts`
  - 적 도시 급습, 리소스 약탈
- [ ] `che_수몰.php` → `NationFloodCommand.ts`
  - 도시 수몰 공격
- [ ] `che_초토화.php` → `NationScorchedEarthCommand.ts`
  - 도시 초토화
- [ ] `che_허보.php` → `NationFalseNewsCommand.ts`
  - 허위 정보 유포
- [ ] `che_피장파장.php` → `NationRetaliationCommand.ts`
  - 보복 전략
- [ ] `che_필사즉생.php` → `NationDesperateCommand.ts`
  - 결사 항전

### Phase 2: 내정 커맨드 (4개)
- [ ] `che_백성동원.php` → `NationMobilizeCommand.ts`
  - 백성 동원
- [ ] `che_의병모집.php` → `NationRecruitMilitiaCommand.ts`
  - 의병 모집
- [ ] `che_이호경식.php` → `NationEconomicWarfareCommand.ts`
  - 이호경식 (경제 전쟁)
- [ ] `cr_인구이동.php` → `NationMigratePopulationCommand.ts`
  - 인구 이동

### Phase 3: 외교 커맨드 (3개)
- [ ] `che_불가침파기제의.php` → `NationBreakNonAggressionCommand.ts`
  - 불가침 파기 제의
- [ ] `che_불가침파기수락.php` → `NationAcceptBreakNonAggressionCommand.ts`
  - 불가침 파기 수락
- [ ] `che_무작위수도이전.php` → `NationRandomCapitalCommand.ts`
  - 무작위 수도 이전

### Phase 4: 부대 관리 커맨드 (1개)
- [ ] `che_부대탈퇴지시.php` → `NationExpelFromTroopCommand.ts`
  - 부대 탈퇴 지시

### Phase 5: 연구 커맨드 (9개)
- [ ] `event_극병연구.php` → `NationResearchPikemanCommand.ts`
- [ ] `event_대검병연구.php` → `NationResearchSwordCommand.ts`
- [ ] `event_무희연구.php` → `NationResearchDancerCommand.ts`
- [ ] `event_산저병연구.php` → `NationResearchMountainCommand.ts`
- [ ] `event_상병연구.php` → `NationResearchMerchantCommand.ts`
- [ ] `event_원융노병연구.php` → `NationResearchCrossbowCommand.ts`
- [ ] `event_음귀병연구.php` → `NationResearchSpiritCommand.ts`
- [ ] `event_화륜차연구.php` → `NationResearchWheelCommand.ts`
- [ ] `event_화시병연구.php` → `NationResearchFireArcherCommand.ts`

## 구현 패턴

```typescript
// packages/logic/src/domain/commands/NationRaidCommand.ts
import { NationCommand, CommandContext, CommandDelta } from './types.js';
import { AllowDiplomacy, ReqWarState } from '../constraints/index.js';

export class NationRaidCommand extends NationCommand {
  readonly id = 'nation_raid';
  readonly name = '급습';

  constraints = [
    new AllowDiplomacy({ allowedStates: ['war'] }),
    new ReqWarState({ minTurns: 3 }),
  ];

  run(ctx: CommandContext): CommandDelta {
    const { nation, targetCity, rand } = ctx;

    // 급습 성공률 계산
    const successRate = this.calculateSuccessRate(nation, targetCity);
    const success = rand.nextFloat() < successRate;

    if (success) {
      return this.createSuccessDelta(nation, targetCity);
    }
    return this.createFailureDelta(nation);
  }
}
```

## 테스트 작성

```typescript
describe('NationRaidCommand', () => {
  it('should raid enemy city successfully', () => {
    const cmd = new NationRaidCommand();
    const delta = cmd.run(createContext({
      nation: createNation({ id: 1 }),
      targetCity: createCity({ nationId: 2 }),
    }));
    expect(delta.logs?.nation?.[1]).toContain('급습');
  });
});
```

## 레거시 참조 파일
- `legacy/hwe/sammo/Command/Nation/` - 국가 커맨드
- `legacy/hwe/sammo/BaseCommand.php` - 기본 커맨드 클래스
