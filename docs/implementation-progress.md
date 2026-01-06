# 구현 진행 현황 보고서

> 생성일: 2026-01-05

## 요약

| 분류        | 레거시 | 구현 완료 | 진행률 |
| ----------- | ------ | --------- | ------ |
| 장수 커맨드 | 55개   | 42개      | 76%    |
| 국가 커맨드 | 39개   | 19개      | 49%    |
| 전투 특기   | 21개   | 0개       | 0%     |
| 내정 특기   | 30개   | 0개       | 0%     |
| 전투 트리거 | 36개   | 0개       | 0%     |
| 장수 트리거 | 4개    | 2개       | 50%    |
| 국가 성향   | 15개   | 0개       | 0%     |

## 1. 장수 커맨드 (General Commands)

### 구현 완료 (42개)

- [x] 휴식 → `GeneralRestCommand.ts`
- [x] che\_인재탐색 → `GeneralTalentSearchCommand.ts`
- [x] che\_화계 → `GeneralFireAttackCommand.ts`
- [x] che\_등용 → `GeneralRecruitCommand.ts`
- [x] che\_등용수락 → `GeneralRecruitAcceptCommand.ts`
- [x] che\_파괴 → `GeneralDestructCommand.ts`
- [x] che\_요양 → `GeneralRecuperateCommand.ts`
- [x] che\_하야 → `GeneralResignCommand.ts`
- [x] che\_장비매매 → `GeneralEquipmentTradeCommand.ts`
- [x] che\_주민선정 → `GeneralDevelopTrustCommand.ts`
- [x] che\_수비강화 → `GeneralStrengthenDefenseCommand.ts`
- [x] che\_집합 → `GeneralAssembleCommand.ts`
- [x] che\_접경귀환 → `GeneralBorderReturnCommand.ts`
- [x] che\_선양 → `GeneralAbdicateCommand.ts`
- [x] che\_출병 → `GeneralWarCommand.ts`
- [x] che\_성벽보수 → `GeneralRepairWallCommand.ts`
- [x] che\_첩보 → `GeneralSpyCommand.ts`
- [x] che\_상업투자 → `GeneralDevelopCommerceCommand.ts`
- [x] che\_건국 → `GeneralFoundNationCommand.ts`
- [x] che\_숙련전환 → `GeneralConvertDexCommand.ts`
- [x] che\_임관 → `GeneralJoinNationCommand.ts`
- [x] che\_소집해제 → `GeneralDischargeCommand.ts`
- [x] che\_전투특기초기화 → `GeneralSpecialResetCommand.ts`
- [x] che\_내정특기초기화 → `GeneralSpecialResetCommand.ts`
- [x] che\_거병 → `GeneralRaiseArmyCommand.ts`
- [x] che\_견문 → `GeneralSightseeingCommand.ts`
- [x] che\_단련 → `GeneralDisciplineCommand.ts`
- [x] che\_이동 → `GeneralMoveCommand.ts`
- [x] che\_귀환 → `GeneralReturnCommand.ts`
- [x] che\_헌납 → `GeneralDonateCommand.ts`
- [x] che\_증여 → `GeneralGiftCommand.ts`
- [x] che\_선동 → `GeneralAgitateCommand.ts`
- [x] che\_방랑 → `GeneralWanderCommand.ts`
- [x] che\_군량매매 → `GeneralTradeCommand.ts`
- [x] che\_물자조달 → `GeneralSupplyCommand.ts`
- [x] che\_전투태세 → `GeneralCombatReadinessCommand.ts`
- [x] che\_강행 → `GeneralForcedMarchCommand.ts`
- [x] che\_징병 → `GeneralConscriptCommand.ts`
- [x] che\_훈련 → `GeneralTrainingCommand.ts`
- [x] che\_모병 → `GeneralDraftCommand.ts`
- [x] che\_사기진작 → `GeneralEncourageCommand.ts`
- [x] che\_정착장려 → `GeneralDevelopPopulationCommand.ts`
- [x] che\_기술연구 → `GeneralResearchTechCommand.ts`
- [x] che\_치안강화 → `GeneralReinforceSecurityCommand.ts`
- [x] che\_농지개간 → `GeneralDevelopAgricultureCommand.ts`
- [x] che\_해산 → `GeneralDisbandCommand.ts`
- [x] che\_탈취 → `GeneralLootCommand.ts`
- [x] cr\_맹훈련 → `GeneralHardTrainingCommand.ts`

### 미구현 (13개)

- [ ] che_NPC능동 → `GeneralNPCActiveCommand.ts` (부분 구현)
- [ ] che\_장수대상임관 → `GeneralFollowJoinCommand.ts` (부분 구현)
- [ ] che\_랜덤임관 → `GeneralRandomJoinCommand.ts` (부분 구현)
- [ ] che\_무작위건국 → `GeneralRandomFoundNationCommand.ts` (부분 구현)
- [ ] che\_모반시도 → `GeneralRebellionCommand.ts` (부분 구현)
- [ ] che\_은퇴 → `GeneralRetireCommand.ts` (부분 구현)
- [ ] che\_파괴 → `GeneralSabotageCommand.ts` (부분 구현)
- [ ] cr\_건국 → `GeneralCRFoundNationCommand.ts` (부분 구현)
- [ ] che\_수송 → `GeneralTransportCommand.ts` (부분 구현)

## 2. 국가 커맨드 (Nation Commands)

### 구현 완료 (19개)

- [x] 휴식 → `NationRestCommand.ts`
- [x] che\_포상 → `NationRewardCommand.ts`
- [x] che\_몰수 → `NationConfiscateCommand.ts`
- [x] che\_천도 → `NationChangeCapitalCommand.ts`
- [x] che\_국기변경 → `NationChangeColorCommand.ts`
- [x] che\_국호변경 → `NationChangeNameCommand.ts`
- [x] che\_선전포고 → `NationDeclareWarCommand.ts`
- [x] che\_불가침제의 → `NationProposeNonAggressionCommand.ts`
- [x] che\_불가침수락 → `NationAcceptNonAggressionCommand.ts`
- [x] che\_종전제의 → `NationProposePeaceCommand.ts`
- [x] che\_종전수락 → `NationAcceptPeaceCommand.ts`
- [x] che\_증축 → `NationExpandCapitalCommand.ts`
- [x] che\_감축 → `NationReduceCapitalCommand.ts`
- [x] che\_발령 → `NationAppointCommand.ts`
- [x] che\_물자원조 → `NationAidCommand.ts`
- [x] che\_세금조정 → `NationAdjustTaxCommand.ts`
- [x] 동맹제의 → `NationProposeAllianceCommand.ts`
- [x] 동맹수락 → `NationAcceptAllianceCommand.ts`

### 미구현 (20개)

- [ ] che\_수몰
- [ ] che\_급습
- [ ] che\_백성동원
- [ ] che\_의병모집
- [ ] che\_초토화
- [ ] che\_허보
- [ ] che\_피장파장
- [ ] che\_필사즉생
- [ ] che\_이호경식
- [ ] che\_부대탈퇴지시
- [ ] che\_불가침파기제의
- [ ] che\_불가침파기수락
- [ ] che\_무작위수도이전
- [ ] cr\_인구이동
- [ ] event\_극병연구
- [ ] event\_대검병연구
- [ ] event\_무희연구
- [ ] event\_산저병연구
- [ ] event\_상병연구
- [ ] event\_원융노병연구
- [ ] event\_음귀병연구
- [ ] event\_화륜차연구
- [ ] event\_화시병연구

## 3. 전투 특기 (ActionSpecialWar) - 21개 전체 미구현

레거시 파일: `legacy/hwe/sammo/ActionSpecialWar/`

| 레거시        | TypeScript     | 상태   |
| ------------- | -------------- | ------ |
| che\_격노.php | -              | 미구현 |
| che\_견고.php | -              | 미구현 |
| che\_공성.php | -              | 미구현 |
| che\_궁병.php | -              | 미구현 |
| che\_귀병.php | -              | 미구현 |
| che\_기병.php | -              | 미구현 |
| che\_돌격.php | -              | 미구현 |
| che\_무쌍.php | -              | 미구현 |
| che\_반계.php | -              | 미구현 |
| che\_보병.php | -              | 미구현 |
| che\_신산.php | -              | 미구현 |
| che\_신중.php | -              | 미구현 |
| che\_위압.php | -              | 미구현 |
| che\_의술.php | -              | 미구현 |
| che\_저격.php | -              | 미구현 |
| che\_집중.php | -              | 미구현 |
| che\_징병.php | -              | 미구현 |
| che\_척사.php | -              | 미구현 |
| che\_필살.php | -              | 미구현 |
| che\_환술.php | -              | 미구현 |
| None.php      | BaseSpecial.ts | 완료   |

## 4. 내정 특기 (ActionSpecialDomestic) - 30개 전체 미구현

레거시 파일: `legacy/hwe/sammo/ActionSpecialDomestic/`

| 레거시                 | TypeScript | 상태   |
| ---------------------- | ---------- | ------ |
| che\_경작.php          | -          | 미구현 |
| che\_거상.php          | -          | 미구현 |
| che\_귀모.php          | -          | 미구현 |
| che\_발명.php          | -          | 미구현 |
| che\_상재.php          | -          | 미구현 |
| che\_수비.php          | -          | 미구현 |
| che\_인덕.php          | -          | 미구현 |
| che\_축성.php          | -          | 미구현 |
| che\_통찰.php          | -          | 미구현 |
| che*event*격노.php     | -          | 미구현 |
| che*event*견고.php     | -          | 미구현 |
| che*event*공성.php     | -          | 미구현 |
| ... (21개 이벤트 특기) | -          | 미구현 |

## 5. 전투 트리거 (WarUnitTrigger) - 36개 중 0개 구현

레거시 파일: `legacy/hwe/sammo/WarUnitTrigger/`

| 레거시                    | TypeScript | 상태   |
| ------------------------- | ---------- | ------ |
| che\_필살발동.php         | -          | 미구현 |
| che\_필살시도.php         | -          | 미구현 |
| che\_회피발동.php         | -          | 미구현 |
| che\_회피시도.php         | -          | 미구현 |
| che\_계략시도.php         | -          | 미구현 |
| che\_계략발동.php         | -          | 미구현 |
| che\_계략실패.php         | -          | 미구현 |
| che\_저격시도.php         | -          | 미구현 |
| che\_저격발동.php         | -          | 미구현 |
| che\_반계시도.php         | -          | 미구현 |
| che\_반계발동.php         | -          | 미구현 |
| che\_위압시도.php         | -          | 미구현 |
| che\_위압발동.php         | -          | 미구현 |
| che\_약탈시도.php         | -          | 미구현 |
| che\_약탈발동.php         | -          | 미구현 |
| che\_선제사격시도.php     | -          | 미구현 |
| che\_선제사격발동.php     | -          | 미구현 |
| che\_돌격지속.php         | -          | 미구현 |
| che\_전멸시페이즈증가.php | -          | 미구현 |
| che\_기병병종전투.php     | -          | 미구현 |
| che\_궁병선제사격.php     | -          | 미구현 |
| che\_전투치료시도.php     | -          | 미구현 |
| che\_전투치료발동.php     | -          | 미구현 |
| che\_저지시도.php         | -          | 미구현 |
| che\_저지발동.php         | -          | 미구현 |
| che\_격노시도.php         | -          | 미구현 |
| che\_격노발동.php         | -          | 미구현 |
| che\_부상무효.php         | -          | 미구현 |
| che\_성벽부상무효.php     | -          | 미구현 |
| che\_퇴각부상무효.php     | -          | 미구현 |
| che\_방어력증가5p.php     | -          | 미구현 |
| che*필살강화*회피불가.php | -          | 미구현 |
| event\_충차아이템소모.php | -          | 미구현 |
| 능력치변경.php            | -          | 미구현 |
| 전투력보정.php            | -          | 미구현 |
| WarActivateSkills.php     | -          | 미구현 |

## 6. 장수 트리거 (GeneralTrigger) - 4개 중 2개 구현

레거시 파일: `legacy/hwe/sammo/GeneralTrigger/`

| 레거시                | TypeScript                   | 상태   |
| --------------------- | ---------------------------- | ------ |
| che\_병력군량소모.php | SoldierMaintenanceTrigger.ts | 완료   |
| che\_부상경감.php     | InjuryReductionTrigger.ts    | 완료   |
| che\_도시치료.php     | -                            | 미구현 |
| che\_아이템치료.php   | -                            | 미구현 |

## 7. 국가 성향 (ActionNationType) - 15개 전체 미구현

레거시 파일: `legacy/hwe/sammo/ActionNationType/`

| 레거시            | TypeScript | 상태   |
| ----------------- | ---------- | ------ |
| None.php          | -          | 미구현 |
| che\_덕가.php     | -          | 미구현 |
| che\_도가.php     | -          | 미구현 |
| che\_도적.php     | -          | 미구현 |
| che\_명가.php     | -          | 미구현 |
| che\_묵가.php     | -          | 미구현 |
| che\_법가.php     | -          | 미구현 |
| che\_병가.php     | -          | 미구현 |
| che\_불가.php     | -          | 미구현 |
| che\_오두미도.php | -          | 미구현 |
| che\_유가.php     | -          | 미구현 |
| che\_음양가.php   | -          | 미구현 |
| che\_종횡가.php   | -          | 미구현 |
| che\_중립.php     | -          | 미구현 |
| che\_태평도.php   | -          | 미구현 |

## 다음 우선순위

1. **전투 시스템 완성** (특기 + 트리거)
2. **국가 커맨드 완성** (외교/전략 커맨드)
3. **국가 성향 구현** (보너스/페널티 시스템)
