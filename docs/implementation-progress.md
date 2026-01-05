# 구현 진행 현황 보고서

> 생성일: 2026-01-05

## 요약

| 분류 | 레거시 | 구현 완료 | 진행률 |
|------|--------|----------|--------|
| 장수 커맨드 | 55개 | 42개 | 76% |
| 국가 커맨드 | 39개 | 19개 | 49% |
| 전투 특기 | 21개 | 0개 | 0% |
| 내정 특기 | 30개 | 0개 | 0% |
| 전투 트리거 | 36개 | 0개 | 0% |
| 장수 트리거 | 4개 | 2개 | 50% |
| 국가 성향 | 15개 | 0개 | 0% |

## 1. 장수 커맨드 (General Commands)

### 구현 완료 (42개)
- [x] 휴식 → `GeneralRestCommand.ts`
- [x] che_인재탐색 → `GeneralTalentSearchCommand.ts`
- [x] che_화계 → `GeneralFireAttackCommand.ts`
- [x] che_등용 → `GeneralRecruitCommand.ts`
- [x] che_등용수락 → `GeneralRecruitAcceptCommand.ts`
- [x] che_파괴 → `GeneralDestructCommand.ts`
- [x] che_요양 → `GeneralRecuperateCommand.ts`
- [x] che_하야 → `GeneralResignCommand.ts`
- [x] che_장비매매 → `GeneralEquipmentTradeCommand.ts`
- [x] che_주민선정 → `GeneralDevelopTrustCommand.ts`
- [x] che_수비강화 → `GeneralStrengthenDefenseCommand.ts`
- [x] che_집합 → `GeneralAssembleCommand.ts`
- [x] che_접경귀환 → `GeneralBorderReturnCommand.ts`
- [x] che_선양 → `GeneralAbdicateCommand.ts`
- [x] che_출병 → `GeneralWarCommand.ts`
- [x] che_성벽보수 → `GeneralRepairWallCommand.ts`
- [x] che_첩보 → `GeneralSpyCommand.ts`
- [x] che_상업투자 → `GeneralDevelopCommerceCommand.ts`
- [x] che_건국 → `GeneralFoundNationCommand.ts`
- [x] che_숙련전환 → `GeneralConvertDexCommand.ts`
- [x] che_임관 → `GeneralJoinNationCommand.ts`
- [x] che_소집해제 → `GeneralDischargeCommand.ts`
- [x] che_전투특기초기화 → `GeneralSpecialResetCommand.ts`
- [x] che_내정특기초기화 → `GeneralSpecialResetCommand.ts`
- [x] che_거병 → `GeneralRaiseArmyCommand.ts`
- [x] che_견문 → `GeneralSightseeingCommand.ts`
- [x] che_단련 → `GeneralDisciplineCommand.ts`
- [x] che_이동 → `GeneralMoveCommand.ts`
- [x] che_귀환 → `GeneralReturnCommand.ts`
- [x] che_헌납 → `GeneralDonateCommand.ts`
- [x] che_증여 → `GeneralGiftCommand.ts`
- [x] che_선동 → `GeneralAgitateCommand.ts`
- [x] che_방랑 → `GeneralWanderCommand.ts`
- [x] che_군량매매 → `GeneralTradeCommand.ts`
- [x] che_물자조달 → `GeneralSupplyCommand.ts`
- [x] che_전투태세 → `GeneralCombatReadinessCommand.ts`
- [x] che_강행 → `GeneralForcedMarchCommand.ts`
- [x] che_징병 → `GeneralConscriptCommand.ts`
- [x] che_훈련 → `GeneralTrainingCommand.ts`
- [x] che_모병 → `GeneralDraftCommand.ts`
- [x] che_사기진작 → `GeneralEncourageCommand.ts`
- [x] che_정착장려 → `GeneralDevelopPopulationCommand.ts`
- [x] che_기술연구 → `GeneralResearchTechCommand.ts`
- [x] che_치안강화 → `GeneralReinforceSecurityCommand.ts`
- [x] che_농지개간 → `GeneralDevelopAgricultureCommand.ts`
- [x] che_해산 → `GeneralDisbandCommand.ts`
- [x] che_탈취 → `GeneralLootCommand.ts`
- [x] cr_맹훈련 → `GeneralHardTrainingCommand.ts`

### 미구현 (13개)
- [ ] che_NPC능동 → `GeneralNPCActiveCommand.ts` (부분 구현)
- [ ] che_장수대상임관 → `GeneralFollowJoinCommand.ts` (부분 구현)
- [ ] che_랜덤임관 → `GeneralRandomJoinCommand.ts` (부분 구현)
- [ ] che_무작위건국 → `GeneralRandomFoundNationCommand.ts` (부분 구현)
- [ ] che_모반시도 → `GeneralRebellionCommand.ts` (부분 구현)
- [ ] che_은퇴 → `GeneralRetireCommand.ts` (부분 구현)
- [ ] che_파괴 → `GeneralSabotageCommand.ts` (부분 구현)
- [ ] cr_건국 → `GeneralCRFoundNationCommand.ts` (부분 구현)
- [ ] che_수송 → `GeneralTransportCommand.ts` (부분 구현)

## 2. 국가 커맨드 (Nation Commands)

### 구현 완료 (19개)
- [x] 휴식 → `NationRestCommand.ts`
- [x] che_포상 → `NationRewardCommand.ts`
- [x] che_몰수 → `NationConfiscateCommand.ts`
- [x] che_천도 → `NationChangeCapitalCommand.ts`
- [x] che_국기변경 → `NationChangeColorCommand.ts`
- [x] che_국호변경 → `NationChangeNameCommand.ts`
- [x] che_선전포고 → `NationDeclareWarCommand.ts`
- [x] che_불가침제의 → `NationProposeNonAggressionCommand.ts`
- [x] che_불가침수락 → `NationAcceptNonAggressionCommand.ts`
- [x] che_종전제의 → `NationProposePeaceCommand.ts`
- [x] che_종전수락 → `NationAcceptPeaceCommand.ts`
- [x] che_증축 → `NationExpandCapitalCommand.ts`
- [x] che_감축 → `NationReduceCapitalCommand.ts`
- [x] che_발령 → `NationAppointCommand.ts`
- [x] che_물자원조 → `NationAidCommand.ts`
- [x] che_세금조정 → `NationAdjustTaxCommand.ts`
- [x] 동맹제의 → `NationProposeAllianceCommand.ts`
- [x] 동맹수락 → `NationAcceptAllianceCommand.ts`

### 미구현 (20개)
- [ ] che_수몰
- [ ] che_급습
- [ ] che_백성동원
- [ ] che_의병모집
- [ ] che_초토화
- [ ] che_허보
- [ ] che_피장파장
- [ ] che_필사즉생
- [ ] che_이호경식
- [ ] che_부대탈퇴지시
- [ ] che_불가침파기제의
- [ ] che_불가침파기수락
- [ ] che_무작위수도이전
- [ ] cr_인구이동
- [ ] event_극병연구
- [ ] event_대검병연구
- [ ] event_무희연구
- [ ] event_산저병연구
- [ ] event_상병연구
- [ ] event_원융노병연구
- [ ] event_음귀병연구
- [ ] event_화륜차연구
- [ ] event_화시병연구

## 3. 전투 특기 (ActionSpecialWar) - 21개 전체 미구현

레거시 파일: `legacy/hwe/sammo/ActionSpecialWar/`

| 레거시 | TypeScript | 상태 |
|--------|------------|------|
| che_격노.php | - | 미구현 |
| che_견고.php | - | 미구현 |
| che_공성.php | - | 미구현 |
| che_궁병.php | - | 미구현 |
| che_귀병.php | - | 미구현 |
| che_기병.php | - | 미구현 |
| che_돌격.php | - | 미구현 |
| che_무쌍.php | - | 미구현 |
| che_반계.php | - | 미구현 |
| che_보병.php | - | 미구현 |
| che_신산.php | - | 미구현 |
| che_신중.php | - | 미구현 |
| che_위압.php | - | 미구현 |
| che_의술.php | - | 미구현 |
| che_저격.php | - | 미구현 |
| che_집중.php | - | 미구현 |
| che_징병.php | - | 미구현 |
| che_척사.php | - | 미구현 |
| che_필살.php | - | 미구현 |
| che_환술.php | - | 미구현 |
| None.php | BaseSpecial.ts | 완료 |

## 4. 내정 특기 (ActionSpecialDomestic) - 30개 전체 미구현

레거시 파일: `legacy/hwe/sammo/ActionSpecialDomestic/`

| 레거시 | TypeScript | 상태 |
|--------|------------|------|
| che_경작.php | - | 미구현 |
| che_거상.php | - | 미구현 |
| che_귀모.php | - | 미구현 |
| che_발명.php | - | 미구현 |
| che_상재.php | - | 미구현 |
| che_수비.php | - | 미구현 |
| che_인덕.php | - | 미구현 |
| che_축성.php | - | 미구현 |
| che_통찰.php | - | 미구현 |
| che_event_격노.php | - | 미구현 |
| che_event_견고.php | - | 미구현 |
| che_event_공성.php | - | 미구현 |
| ... (21개 이벤트 특기) | - | 미구현 |

## 5. 전투 트리거 (WarUnitTrigger) - 36개 중 0개 구현

레거시 파일: `legacy/hwe/sammo/WarUnitTrigger/`

| 레거시 | TypeScript | 상태 |
|--------|------------|------|
| che_필살발동.php | - | 미구현 |
| che_필살시도.php | - | 미구현 |
| che_회피발동.php | - | 미구현 |
| che_회피시도.php | - | 미구현 |
| che_계략시도.php | - | 미구현 |
| che_계략발동.php | - | 미구현 |
| che_계략실패.php | - | 미구현 |
| che_저격시도.php | - | 미구현 |
| che_저격발동.php | - | 미구현 |
| che_반계시도.php | - | 미구현 |
| che_반계발동.php | - | 미구현 |
| che_위압시도.php | - | 미구현 |
| che_위압발동.php | - | 미구현 |
| che_약탈시도.php | - | 미구현 |
| che_약탈발동.php | - | 미구현 |
| che_선제사격시도.php | - | 미구현 |
| che_선제사격발동.php | - | 미구현 |
| che_돌격지속.php | - | 미구현 |
| che_전멸시페이즈증가.php | - | 미구현 |
| che_기병병종전투.php | - | 미구현 |
| che_궁병선제사격.php | - | 미구현 |
| che_전투치료시도.php | - | 미구현 |
| che_전투치료발동.php | - | 미구현 |
| che_저지시도.php | - | 미구현 |
| che_저지발동.php | - | 미구현 |
| che_격노시도.php | - | 미구현 |
| che_격노발동.php | - | 미구현 |
| che_부상무효.php | - | 미구현 |
| che_성벽부상무효.php | - | 미구현 |
| che_퇴각부상무효.php | - | 미구현 |
| che_방어력증가5p.php | - | 미구현 |
| che_필살강화_회피불가.php | - | 미구현 |
| event_충차아이템소모.php | - | 미구현 |
| 능력치변경.php | - | 미구현 |
| 전투력보정.php | - | 미구현 |
| WarActivateSkills.php | - | 미구현 |

## 6. 장수 트리거 (GeneralTrigger) - 4개 중 2개 구현

레거시 파일: `legacy/hwe/sammo/GeneralTrigger/`

| 레거시 | TypeScript | 상태 |
|--------|------------|------|
| che_병력군량소모.php | SoldierMaintenanceTrigger.ts | 완료 |
| che_부상경감.php | InjuryReductionTrigger.ts | 완료 |
| che_도시치료.php | - | 미구현 |
| che_아이템치료.php | - | 미구현 |

## 7. 국가 성향 (ActionNationType) - 15개 전체 미구현

레거시 파일: `legacy/hwe/sammo/ActionNationType/`

| 레거시 | TypeScript | 상태 |
|--------|------------|------|
| None.php | - | 미구현 |
| che_덕가.php | - | 미구현 |
| che_도가.php | - | 미구현 |
| che_도적.php | - | 미구현 |
| che_명가.php | - | 미구현 |
| che_묵가.php | - | 미구현 |
| che_법가.php | - | 미구현 |
| che_병가.php | - | 미구현 |
| che_불가.php | - | 미구현 |
| che_오두미도.php | - | 미구현 |
| che_유가.php | - | 미구현 |
| che_음양가.php | - | 미구현 |
| che_종횡가.php | - | 미구현 |
| che_중립.php | - | 미구현 |
| che_태평도.php | - | 미구현 |

## 다음 우선순위

1. **전투 시스템 완성** (특기 + 트리거)
2. **국가 커맨드 완성** (외교/전략 커맨드)
3. **국가 성향 구현** (보너스/페널티 시스템)
