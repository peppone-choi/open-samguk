# 1:1 포팅 진행 상황 체크리스트

## 1. 커맨드 (Commands)

### 일반/장수 커맨드 (General Commands)

- [x] che\_인재탐색 (TalentSearchCommand)
- [x] 휴식 (RestCommand)
- [x] che\_화계 (FireAttackCommand)
- [ ] cr\_맹훈련
- [x] che\_등용 (RecruitProposalCommand) - `GeneralRecruitCommand.ts` (확인됨)
- [x] che\_파괴 (DestructCommand)
- [x] che\_요양 (RecuperateCommand)
- [x] che\_하야 (ResignCommand)
- [x] che\_장비매매 (EquipmentTradeCommand)
- [x] che\_주민선정 (DevelopTrustCommand)
- [x] che\_수비강화 (StrengthenDefenseCommand)
- [x] che\_집합 (AssembleCommand)
- [ ] che\_접경귀환 (BorderReturnCommand)
- [ ] che_NPC능동 (NPCActiveCommand)
- [ ] che\_선양 (AbdicateCommand)
- [x] che\_출병 (AttackCommand)
- [x] che\_성벽보수 (RepairWallCommand)
- [x] che\_첩보 (SpyCommand)
- [x] che\_상업투자 (DevelopCommerceCommand)
- [x] che\_건국 (FoundNationCommand)
- [x] che\_숙련전환 (ConvertDexCommand)
- [x] che\_임관 (JoinNationCommand)
- [x] che\_소집해제 (DischargeCommand)
- [ ] che\_장수대상임관 (FollowGeneralJoinCommand)
- [x] che\_전투특기초기화 (WarSkillResetCommand) - `GeneralSpecialResetCommand.ts`
- [x] che\_등용수락 (RecruitAcceptCommand)
- [x] che\_거병 (RaiseArmyCommand)
- [x] che\_견문 (SightseeingCommand)
- [ ] cr\_건국 (FoundNationCommand 공용)
- [ ] che\_탈취 (LootCityCommand)
- [ ] che\_해산 (DisbandNationCommand)
- [x] che\_단련 (DisciplineCommand)
- [x] che\_이동 (MoveCommand)
- [x] che\_내정특기초기화 (DomesticSkillResetCommand) - `GeneralSpecialResetCommand.ts`
- [x] che\_귀환 (ReturnCommand)
- [x] che\_헌납 (DonateCommand)
- [x] che\_증여 (GiftCommand)
- [x] che\_선동 (AgitateCommand)
- [ ] che\_방랑 (WanderCommand)
- [x] che\_군량매매 (ResourceTradeCommand) - `GeneralTradeCommand.ts`
- [ ] che\_물자조달 (FetchResourceCommand)
- [ ] che\_전투태세 (CombatReadinessCommand)
- [x] che\_강행 (ForcedMarchCommand)
- [ ] che\_은퇴 (RetirementCommand)
- [x] che\_징병 (ConscriptCommand) - `GeneralConscriptCommand.ts`
- [x] che\_훈련 (TrainingCommand)
- [x] che\_모병 (DraftCommand) - `GeneralDraftCommand.ts`
- [x] che\_사기진작 (EncourageCommand)
- [x] che\_정착장려 (DevelopPopulationCommand)
- [x] che\_기술연구 (ResearchTechCommand)
- [ ] che\_랜덤임관 (RandomJoinCommand)
- [x] che\_치안강화 (DevelopSecurityCommand) - `GeneralReinforceSecurityCommand.ts`
- [x] che\_농지개간 (DevelopAgricultureCommand)
- [ ] che\_무작위건국 (RandomFoundNationCommand)
- [ ] che\_모반시도 (RebellionCommand)
- [ ] cr\_맹훈련 (HardTrainingCommand)
- [x] che\_수송 (TransportCommand) - `GeneralTransportCommand.ts` (New/Mapped)

### 국가 전략 커맨드 (Nation Commands)

- [ ] cr\_인구이동 (MigratePopulationCommand)
- [ ] che\_수몰 (FloodAttackCommand)
- [ ] event\_대검병연구 (ResearchUnitCommand)
- [x] che\_포상 (RewardGeneralCommand)
- [x] che\_몰수 (ConfiscateCommand) - `NationConfiscateCommand.ts`
- [ ] che\_종전수락 (AcceptStopWarCommand)
- [ ] event\_극병연구 (ResearchUnitCommand)
- [ ] che\_발령 (AppointMoveCommand)
- [ ] event\_무희연구 (ResearchUnitCommand)
- [ ] che\_부대탈퇴지시 (ExpelFromTroopCommand)
- [ ] che\_불가침파기제의 (CancelNoAggressionCommand)
- [ ] event\_화시병연구 (ResearchUnitCommand)
- [ ] che\_필사즉생 (DesperateCommand)
- [ ] event\_음귀병연구 (ResearchUnitCommand)
- [ ] che\_물자원조 (NationAidCommand)
- [ ] che\_의병모집 (RecruitVolunteersCommand)
- [ ] che\_증축 (ExpandCapitalCommand)
- [ ] che\_종전제의 (ProposeStopWarCommand)
- [x] che\_천도 (NationChangeCapitalCommand)
- [ ] che\_백성동원 (MobilizeCommand)
- [x] che\_국기변경 (NationChangeColorCommand)
- [ ] che\_감축 (ReduceCapitalCommand)
- [x] che\_국호변경 (NationChangeNameCommand)
- [ ] che\_불가침제의 (ProposeNoAggressionCommand)
- [ ] che\_불가침파기수락 (AcceptCancelNoAggressionCommand)
- [ ] event\_산저병연구 (ResearchUnitCommand)
- [ ] che*회피*둔갑천서
- [ ] che*내정*납금박산로
- [ ] che*격노*구정신단경 (FuryItem)
- [ ] che*계략*삼략 (StrategyBookItem)
- [ ] che*계략*육도 (StrategyBookItem)
- [ ] (기타 150여종 순차 포팅 필요)

## 3. 특기 (Special Skills)

### 전투 특기 (Special War)

- [ ] che\_무쌍
- [ ] che\_견고
- [ ] che\_격노
- [ ] che\_신산
- [ ] che\_집중
- [ ] che\_기병
- [ ] che\_위압
- [ ] che\_저격
- [ ] che\_환술
- [ ] che\_공성 (SpecialSiegeWar)
- [ ] che\_의술 (SpecialMedicine)
- [ ] che\_필살 (SpecialCritical)
- [ ] che\_반계 (SpecialCounterMagic)
- [ ] che\_징병 (SpecialDraft)
- [ ] (남은 7종 포팅 필요)

### 내정 특기 (Special Domestic)

- [ ] che\_경작 (SpecialCultivation)
- [ ] che\_상재 (SpecialCommerce)
- [ ] che\_인덕 (SpecialBenevolence)
- [ ] che\_축성 (SpecialConstruction)
- [ ] che\_수비 (SpecialDefense)
- [ ] che\_거상 (비활성화됨)
- [ ] che\_발명 (SpecialInvention)
- [ ] che\_통찰 (SpecialInsight)
- [ ] che\_귀모 (SpecialDivineStrategy)
- [ ] (남은 22종 포팅 필요)

## 4. 국가 성향 (Nation Types)

- [ ] che\_덕가
- [ ] che\_도가
- [ ] che\_도적
- [ ] che\_명가
- [ ] che\_묵가
- [ ] che\_법가
- [ ] che\_병가
- [ ] che\_불가
- [ ] che\_음양가
- [ ] che\_종횡가
- [ ] che\_태평도
- [ ] che\_오두미도
- [ ] (남은 2종 포팅 필요)

## 5. 트리거 (Triggers)

### 장수 트리거 (General Triggers)

- [ ] che\_부상경감 (InjuryRecoveryTrigger)
- [x] che\_병력군량소모 (SoldierMaintenanceTrigger) - `SoldierMaintenanceTrigger.ts` (확인됨)
- [ ] che\_도시치료 (CityCureTrigger)
- [ ] che\_아이템치료 (ItemCureTrigger)

### 전투 유닛 트리거 (WarUnit Triggers)

- [ ] che\_필살발동 (CriticalAttackTrigger)
- [ ] che\_회피발동 (EvasionTrigger)
- [ ] che\_회피시도 (EvasionTrigger 공용)
- [ ] che\_전멸시페이즈증가 (PhaseIncreaseOnVictoryTrigger)
- [ ] che\_계략시도 (MagicStrategyTrigger)
- [ ] che\_계략발동 (MagicActivationTrigger)
- [ ] che\_계략실패 (MagicFailureTrigger)
- [ ] che\_선제사격시도 (PreemptiveFireTrigger)
- [ ] che\_선제사격발동 (PreemptiveFireTrigger 공용)
- [ ] che\_약탈시도 (LootingTrigger)
- [ ] che\_약탈발동 (LootingTrigger 공용)
- [ ] che\_위압시도 (IntimidationTrigger)
- [ ] che\_위압발동 (IntimidationTrigger 공용)
- [ ] che\_저격시도 (SnipeTrigger)
- [ ] che\_저격발동 (SnipeTrigger 공용)
- [ ] che\_반계시도 (CounterMagicTrigger)
- [ ] che\_반계발동 (CounterMagicTrigger 공용)
- [ ] (남은 18여종 포팅 필요)
