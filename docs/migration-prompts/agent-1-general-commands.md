# Agent 1: General Commands 마이그레이션

## 업무 범위
`legacy/hwe/sammo/Command/General/` 디렉토리의 모든 장수 커맨드를 TypeScript로 포팅

## 대상 디렉토리
- 소스: `legacy/hwe/sammo/Command/General/*.php` (55개 파일)
- 타겟: `packages/logic/src/domain/commands/General*.ts`

## 체크리스트

### 이미 포팅된 커맨드 (확인 필요)
- [x] che_인재탐색 → GeneralTalentSearchCommand.ts
- [x] 휴식 → GeneralRestCommand.ts
- [x] che_화계 → GeneralFireAttackCommand.ts
- [x] che_등용 → GeneralRecruitCommand.ts
- [x] che_파괴 → GeneralDestructCommand.ts
- [x] che_요양 → GeneralRecuperateCommand.ts
- [x] che_하야 → GeneralResignCommand.ts
- [x] che_장비매매 → GeneralEquipmentTradeCommand.ts
- [x] che_주민선정 → GeneralDevelopTrustCommand.ts
- [x] che_수비강화 → GeneralStrengthenDefenseCommand.ts
- [x] che_집합 → GeneralAssembleCommand.ts
- [x] che_출병 → GeneralWarCommand.ts
- [x] che_성벽보수 → GeneralRepairWallCommand.ts
- [x] che_첩보 → GeneralSpyCommand.ts
- [x] che_상업투자 → GeneralDevelopCommerceCommand.ts
- [x] che_건국 → GeneralFoundNationCommand.ts
- [x] che_숙련전환 → GeneralConvertDexCommand.ts
- [x] che_임관 → GeneralJoinNationCommand.ts
- [x] che_소집해제 → GeneralDischargeCommand.ts
- [x] che_전투특기초기화 → GeneralSpecialResetCommand.ts
- [x] che_등용수락 → GeneralRecruitAcceptCommand.ts
- [x] che_거병 → GeneralRaiseArmyCommand.ts
- [x] che_견문 → GeneralSightseeingCommand.ts
- [x] che_단련 → GeneralDisciplineCommand.ts
- [x] che_이동 → GeneralMoveCommand.ts
- [x] che_내정특기초기화 → GeneralSpecialResetCommand.ts
- [x] che_귀환 → GeneralReturnCommand.ts
- [x] che_헌납 → GeneralDonateCommand.ts
- [x] che_증여 → GeneralGiftCommand.ts
- [x] che_선동 → GeneralAgitateCommand.ts
- [x] che_군량매매 → GeneralTradeCommand.ts
- [x] che_강행 → GeneralForcedMarchCommand.ts
- [x] che_징병 → GeneralConscriptCommand.ts
- [x] che_훈련 → GeneralTrainingCommand.ts
- [x] che_모병 → GeneralDraftCommand.ts
- [x] che_사기진작 → GeneralEncourageCommand.ts
- [x] che_정착장려 → GeneralDevelopPopulationCommand.ts
- [x] che_기술연구 → GeneralResearchTechCommand.ts
- [x] che_치안강화 → GeneralReinforceSecurityCommand.ts
- [x] che_농지개간 → GeneralDevelopAgricultureCommand.ts
- [x] che_수송 → GeneralTransportCommand.ts

### 포팅 필요한 커맨드
- [ ] che_NPC능동 → GeneralNPCActiveCommand.ts (완성도 확인)
- [ ] che_선양 → GeneralAbdicateCommand.ts
- [ ] che_접경귀환 → GeneralBorderReturnCommand.ts
- [ ] che_장수대상임관 → GeneralFollowJoinCommand.ts
- [ ] cr_맹훈련 → GeneralHardTrainingCommand.ts
- [ ] che_탈취 → GeneralLootCommand.ts
- [ ] che_해산 → GeneralDisbandCommand.ts
- [ ] che_은퇴 → GeneralRetireCommand.ts
- [ ] che_랜덤임관 → GeneralRandomJoinCommand.ts
- [ ] che_모반시도 → GeneralRebellionCommand.ts
- [ ] che_무작위건국 → GeneralRandomFoundNationCommand.ts
- [ ] che_물자조달 → GeneralSupplyCommand.ts
- [ ] che_전투태세 → GeneralCombatReadinessCommand.ts
- [ ] che_방랑 → GeneralWanderCommand.ts (확인)
- [ ] cr_건국 → 확인 필요

## 포팅 규칙
1. 레거시 PHP 파일의 로직을 TypeScript로 변환
2. `GeneralCommand` 베이스 클래스 상속
3. `actionName`, `run()`, `checkConstraints()` 구현
4. `ConstraintHelper` 사용하여 제약조건 정의
5. `WorldDelta` 반환 형식 준수
6. `index.ts`에 export 추가

## 파일 구조
```typescript
import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

export class General{Name}Command extends GeneralCommand {
  readonly actionName = '액션명';

  constructor() {
    super();
    this.minConditionConstraints = [...];
    this.fullConditionConstraints = [...];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    // 구현
  }
}
```
