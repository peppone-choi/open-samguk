# 1:1 포팅 진행 상황 체크리스트

## 1. 커맨드 (Commands)
### 일반/장수 커맨드 (General Commands)
- [x] che_인재탐색 (TalentSearchCommand)
- [x] 휴식 (RestCommand)
- [x] che_화계 (FireAttackCommand)
- [ ] cr_맹훈련
- [x] che_등용 (RecruitProposalCommand) - `GeneralRecruitCommand.ts` (확인됨)
- [x] che_파괴 (DestructCommand)
- [x] che_요양 (RecuperateCommand)
- [x] che_하야 (ResignCommand)
- [x] che_장비매매 (EquipmentTradeCommand)
- [x] che_주민선정 (DevelopTrustCommand)
- [x] che_수비강화 (StrengthenDefenseCommand)
- [x] che_집합 (AssembleCommand)
- [ ] che_접경귀환 (BorderReturnCommand)
- [ ] che_NPC능동 (NPCActiveCommand)
- [ ] che_선양 (AbdicateCommand)
- [x] che_출병 (AttackCommand)
- [x] che_성벽보수 (RepairWallCommand)
- [x] che_첩보 (SpyCommand)
- [x] che_상업투자 (DevelopCommerceCommand)
- [x] che_건국 (FoundNationCommand)
- [x] che_숙련전환 (ConvertDexCommand)
- [x] che_임관 (JoinNationCommand)
- [x] che_소집해제 (DischargeCommand)
- [ ] che_장수대상임관 (FollowGeneralJoinCommand)
- [x] che_전투특기초기화 (WarSkillResetCommand) - `GeneralSpecialResetCommand.ts`
- [x] che_등용수락 (RecruitAcceptCommand)
- [x] che_거병 (RaiseArmyCommand)
- [x] che_견문 (SightseeingCommand)
- [ ] cr_건국 (FoundNationCommand 공용)
- [ ] che_탈취 (LootCityCommand)
- [ ] che_해산 (DisbandNationCommand)
- [x] che_단련 (DisciplineCommand)
- [x] che_이동 (MoveCommand)
- [x] che_내정특기초기화 (DomesticSkillResetCommand) - `GeneralSpecialResetCommand.ts`
- [x] che_귀환 (ReturnCommand)
- [x] che_헌납 (DonateCommand)
- [x] che_증여 (GiftCommand)
- [x] che_선동 (AgitateCommand)
- [ ] che_방랑 (WanderCommand)
- [x] che_군량매매 (ResourceTradeCommand) - `GeneralTradeCommand.ts`
- [ ] che_물자조달 (FetchResourceCommand)
- [ ] che_전투태세 (CombatReadinessCommand)
- [x] che_강행 (ForcedMarchCommand)
- [ ] che_은퇴 (RetirementCommand)
- [x] che_징병 (ConscriptCommand) - `GeneralConscriptCommand.ts`
- [x] che_훈련 (TrainingCommand)
- [x] che_모병 (DraftCommand) - `GeneralDraftCommand.ts`
- [x] che_사기진작 (EncourageCommand)
- [x] che_정착장려 (DevelopPopulationCommand)
- [x] che_기술연구 (ResearchTechCommand)
- [ ] che_랜덤임관 (RandomJoinCommand)
- [x] che_치안강화 (DevelopSecurityCommand) - `GeneralReinforceSecurityCommand.ts`
- [x] che_농지개간 (DevelopAgricultureCommand)
- [ ] che_무작위건국 (RandomFoundNationCommand)
- [ ] che_모반시도 (RebellionCommand)
- [ ] cr_맹훈련 (HardTrainingCommand)
- [x] che_수송 (TransportCommand) - `GeneralTransportCommand.ts` (New/Mapped)


### 국가 전략 커맨드 (Nation Commands)
- [ ] cr_인구이동 (MigratePopulationCommand)
- [ ] che_수몰 (FloodAttackCommand)
- [ ] event_대검병연구 (ResearchUnitCommand)
- [x] che_포상 (RewardGeneralCommand)
- [x] che_몰수 (ConfiscateCommand) - `NationConfiscateCommand.ts`
- [ ] che_종전수락 (AcceptStopWarCommand)
- [ ] event_극병연구 (ResearchUnitCommand)
- [ ] che_발령 (AppointMoveCommand)
- [ ] event_무희연구 (ResearchUnitCommand)
- [ ] che_부대탈퇴지시 (ExpelFromTroopCommand)
- [ ] che_불가침파기제의 (CancelNoAggressionCommand)
- [ ] event_화시병연구 (ResearchUnitCommand)
- [ ] che_필사즉생 (DesperateCommand)
- [ ] event_음귀병연구 (ResearchUnitCommand)
- [ ] che_물자원조 (NationAidCommand)
- [ ] che_의병모집 (RecruitVolunteersCommand)
- [ ] che_증축 (ExpandCapitalCommand)
- [ ] che_종전제의 (ProposeStopWarCommand)
- [x] che_천도 (NationChangeCapitalCommand)
- [ ] che_백성동원 (MobilizeCommand)
- [x] che_국기변경 (NationChangeColorCommand)
- [ ] che_감축 (ReduceCapitalCommand)
- [x] che_국호변경 (NationChangeNameCommand)
- [ ] che_불가침제의 (ProposeNoAggressionCommand)
- [ ] che_불가침파기수락 (AcceptCancelNoAggressionCommand)
- [ ] event_산저병연구 (ResearchUnitCommand)
- [ ] che_회피_둔갑천서
- [ ] che_내정_납금박산로
- [ ] che_격노_구정신단경 (FuryItem)
- [ ] che_계략_삼략 (StrategyBookItem)
- [ ] che_계략_육도 (StrategyBookItem)
- [ ] (기타 150여종 순차 포팅 필요)

## 3. 특기 (Special Skills)
### 전투 특기 (Special War)
- [ ] che_무쌍
- [ ] che_견고
- [ ] che_격노
- [ ] che_신산
- [ ] che_집중
- [ ] che_기병
- [ ] che_위압
- [ ] che_저격
- [ ] che_환술
- [ ] che_공성 (SpecialSiegeWar)
- [ ] che_의술 (SpecialMedicine)
- [ ] che_필살 (SpecialCritical)
- [ ] che_반계 (SpecialCounterMagic)
- [ ] che_징병 (SpecialDraft)
- [ ] (남은 7종 포팅 필요)

### 내정 특기 (Special Domestic)
- [ ] che_경작 (SpecialCultivation)
- [ ] che_상재 (SpecialCommerce)
- [ ] che_인덕 (SpecialBenevolence)
- [ ] che_축성 (SpecialConstruction)
- [ ] che_수비 (SpecialDefense)
- [ ] che_거상 (비활성화됨)
- [ ] che_발명 (SpecialInvention)
- [ ] che_통찰 (SpecialInsight)
- [ ] che_귀모 (SpecialDivineStrategy)
- [ ] (남은 22종 포팅 필요)


## 4. 국가 성향 (Nation Types)
- [ ] che_덕가
- [ ] che_도가
- [ ] che_도적
- [ ] che_명가
- [ ] che_묵가
- [ ] che_법가
- [ ] che_병가
- [ ] che_불가
- [ ] che_음양가
- [ ] che_종횡가
- [ ] che_태평도
- [ ] che_오두미도
- [ ] (남은 2종 포팅 필요)

## 5. 트리거 (Triggers)
### 장수 트리거 (General Triggers)
- [ ] che_부상경감 (InjuryRecoveryTrigger)
- [x] che_병력군량소모 (SoldierMaintenanceTrigger) - `SoldierMaintenanceTrigger.ts` (확인됨)
- [ ] che_도시치료 (CityCureTrigger)
- [ ] che_아이템치료 (ItemCureTrigger)

### 전투 유닛 트리거 (WarUnit Triggers)
- [ ] che_필살발동 (CriticalAttackTrigger)
- [ ] che_회피발동 (EvasionTrigger)
- [ ] che_회피시도 (EvasionTrigger 공용)
- [ ] che_전멸시페이즈증가 (PhaseIncreaseOnVictoryTrigger)
- [ ] che_계략시도 (MagicStrategyTrigger)
- [ ] che_계략발동 (MagicActivationTrigger)
- [ ] che_계략실패 (MagicFailureTrigger)
- [ ] che_선제사격시도 (PreemptiveFireTrigger)
- [ ] che_선제사격발동 (PreemptiveFireTrigger 공용)
- [ ] che_약탈시도 (LootingTrigger)
- [ ] che_약탈발동 (LootingTrigger 공용)
- [ ] che_위압시도 (IntimidationTrigger)
- [ ] che_위압발동 (IntimidationTrigger 공용)
- [ ] che_저격시도 (SnipeTrigger)
- [ ] che_저격발동 (SnipeTrigger 공용)
- [ ] che_반계시도 (CounterMagicTrigger)
- [ ] che_반계발동 (CounterMagicTrigger 공용)
- [ ] (남은 18여종 포팅 필요)




