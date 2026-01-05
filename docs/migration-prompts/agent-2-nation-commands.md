# Agent 2: Nation Commands 마이그레이션

## 업무 범위
`legacy/hwe/sammo/Command/Nation/` 디렉토리의 모든 국가 커맨드를 TypeScript로 포팅

## 대상 디렉토리
- 소스: `legacy/hwe/sammo/Command/Nation/*.php` (38개 파일)
- 타겟: `packages/logic/src/domain/commands/Nation*.ts`

## 체크리스트

### 이미 포팅된 커맨드
- [x] che_천도 → NationChangeCapitalCommand.ts
- [x] che_국기변경 → NationChangeColorCommand.ts
- [x] che_국호변경 → NationChangeNameCommand.ts
- [x] che_몰수 → NationConfiscateCommand.ts
- [x] che_포상 → NationRewardCommand.ts

### 포팅 필요한 커맨드
- [ ] che_감축 → NationReduceCapitalCommand.ts
- [ ] che_급습 → NationRaidCommand.ts
- [ ] che_물자원조 → NationAidCommand.ts
- [ ] che_발령 → NationAppointCommand.ts
- [ ] che_백성동원 → NationMobilizeCommand.ts
- [ ] che_부대탈퇴지시 → NationExpelFromTroopCommand.ts
- [ ] che_불가침수락 → NationAcceptNonAggressionCommand.ts
- [ ] che_불가침제의 → NationProposeNonAggressionCommand.ts
- [ ] che_불가침파기수락 → NationAcceptCancelNonAggressionCommand.ts
- [ ] che_불가침파기제의 → NationCancelNonAggressionCommand.ts
- [ ] che_선전포고 → NationDeclareWarCommand.ts
- [ ] che_수몰 → NationFloodCommand.ts
- [ ] che_의병모집 → NationRecruitVolunteersCommand.ts
- [ ] che_이호경식 → NationTigerFightCommand.ts
- [ ] che_종전수락 → NationAcceptPeaceCommand.ts
- [ ] che_종전제의 → NationProposePeaceCommand.ts
- [ ] che_증축 → NationExpandCapitalCommand.ts
- [ ] che_초토화 → NationScorchedEarthCommand.ts
- [ ] che_피장파장 → NationRetaliationCommand.ts
- [ ] che_필사즉생 → NationDesperateCommand.ts
- [ ] che_허보 → NationFalseReportCommand.ts
- [ ] che_무작위수도이전 → NationRandomCapitalCommand.ts
- [ ] cr_인구이동 → NationMigratePopulationCommand.ts
- [ ] event_극병연구 → NationResearchHalberdCommand.ts
- [ ] event_대검병연구 → NationResearchGreatswordCommand.ts
- [ ] event_무희연구 → NationResearchDancerCommand.ts
- [ ] event_산저병연구 → NationResearchMountainCommand.ts
- [ ] event_상병연구 → NationResearchElephantCommand.ts
- [ ] event_원융노병연구 → NationResearchCrossbowCommand.ts
- [ ] event_음귀병연구 → NationResearchGhostCommand.ts
- [ ] event_화륜차연구 → NationResearchChariotCommand.ts
- [ ] event_화시병연구 → NationResearchFireArcherCommand.ts
- [ ] 휴식 → NationRestCommand.ts

## 포팅 규칙
1. `NationCommand` 베이스 클래스 생성 필요
2. 레거시 PHP 로직을 TypeScript로 변환
3. 외교 상태 변경 커맨드는 `DiplomacyState` 연동
4. 연구 커맨드는 `TechState` 연동

## 파일 구조
```typescript
import { RandUtil } from '@sammo-ts/common';
import { NationCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

export class Nation{Name}Command extends NationCommand {
  readonly actionName = '액션명';

  run(rng: RandUtil, snapshot: WorldSnapshot, nationId: number, args: Record<string, any>): WorldDelta {
    // 구현
  }
}
```
