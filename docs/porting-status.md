# 1:1 포팅 진행 상황 체크리스트

> 최종 업데이트: 2026-01-10

## 요약

| 카테고리          | 완료 | 전체 | 비율     |
| ----------------- | ---- | ---- | -------- |
| 장수 커맨드       | 56   | 56   | **100%** |
| 국가 커맨드       | 41   | 41   | **100%** |
| 프론트엔드 페이지 | 18   | 18   | **100%** |
| 전투 특기         | 38   | 38   | **100%** |
| Constraints       | 73   | 73   | **100%** |
| 경매 시스템       | 6    | 6    | **100%** |
| 베팅 시스템       | 2    | 2    | **100%** |
| 상속 포인트       | 2    | 2    | **100%** |
| 토너먼트          | 2    | 2    | **100%** |

---

## 1. 커맨드 (Commands)

### 일반/장수 커맨드 (General Commands) - 56/56 ✅

- [x] che\_인재탐색 → `GeneralTalentSearchCommand.ts`
- [x] 휴식 → `GeneralRestCommand.ts`
- [x] che\_화계 → `GeneralFireAttackCommand.ts`
- [x] cr\_맹훈련 → `GeneralHardTrainingCommand.ts`
- [x] che\_등용 → `GeneralRecruitCommand.ts`
- [x] che\_파괴 → `GeneralDestructCommand.ts`
- [x] che\_요양 → `GeneralRecuperateCommand.ts`
- [x] che\_하야 → `GeneralResignCommand.ts`
- [x] che\_장비매매 → `GeneralEquipmentTradeCommand.ts`
- [x] che\_주민선정 → `GeneralDevelopTrustCommand.ts`
- [x] che\_수비강화 → `GeneralStrengthenDefenseCommand.ts`
- [x] che\_집합 → `GeneralAssembleCommand.ts`
- [x] che\_접경귀환 → `GeneralBorderReturnCommand.ts`
- [x] che_NPC능동 → `GeneralNPCActiveCommand.ts`
- [x] che\_선양 → `GeneralAbdicateCommand.ts`
- [x] che\_출병 → `GeneralWarCommand.ts`
- [x] che\_성벽보수 → `GeneralRepairWallCommand.ts`
- [x] che\_첩보 → `GeneralSpyCommand.ts`
- [x] che\_상업투자 → `GeneralDevelopCommerceCommand.ts`
- [x] che\_건국 → `GeneralFoundNationCommand.ts`
- [x] che\_숙련전환 → `GeneralConvertDexCommand.ts`
- [x] che\_임관 → `GeneralJoinNationCommand.ts`
- [x] che\_소집해제 → `GeneralDischargeCommand.ts`
- [x] che\_장수대상임관 → `GeneralFollowJoinCommand.ts`
- [x] che\_전투특기초기화 → `GeneralSpecialResetCommand.ts`
- [x] che\_등용수락 → `GeneralRecruitAcceptCommand.ts`
- [x] che\_거병 → `GeneralRaiseArmyCommand.ts`
- [x] che\_견문 → `GeneralSightseeingCommand.ts`
- [x] cr\_건국 → `GeneralCRFoundNationCommand.ts`
- [x] che\_탈취 → `GeneralLootCommand.ts`
- [x] che\_해산 → `GeneralDisbandCommand.ts`
- [x] che\_단련 → `GeneralDisciplineCommand.ts`
- [x] che\_이동 → `GeneralMoveCommand.ts`
- [x] che\_내정특기초기화 → `GeneralSpecialResetCommand.ts` (공용)
- [x] che\_귀환 → `GeneralReturnCommand.ts`
- [x] che\_헌납 → `GeneralDonateCommand.ts`
- [x] che\_증여 → `GeneralGiftCommand.ts`
- [x] che\_선동 → `GeneralAgitateCommand.ts`
- [x] che\_방랑 → `GeneralWanderCommand.ts`
- [x] che\_군량매매 → `GeneralTradeCommand.ts`
- [x] che\_물자조달 → `GeneralSupplyCommand.ts`
- [x] che\_전투태세 → `GeneralCombatReadinessCommand.ts`
- [x] che\_강행 → `GeneralForcedMarchCommand.ts`
- [x] che\_은퇴 → `GeneralRetireCommand.ts`
- [x] che\_징병 → `GeneralConscriptCommand.ts`
- [x] che\_훈련 → `GeneralTrainingCommand.ts`
- [x] che\_모병 → `GeneralDraftCommand.ts`
- [x] che\_사기진작 → `GeneralEncourageCommand.ts`
- [x] che\_정착장려 → `GeneralDevelopPopulationCommand.ts`
- [x] che\_기술연구 → `GeneralResearchTechCommand.ts`
- [x] che\_랜덤임관 → `GeneralRandomJoinCommand.ts`
- [x] che\_치안강화 → `GeneralReinforceSecurityCommand.ts`
- [x] che\_농지개간 → `GeneralDevelopAgricultureCommand.ts`
- [x] che\_무작위건국 → `GeneralRandomFoundNationCommand.ts`
- [x] che\_모반시도 → `GeneralRebellionCommand.ts`
- [x] che\_수송 → `GeneralTransportCommand.ts`
- [x] che\_파괴공작 → `GeneralSabotageCommand.ts`

### 국가 전략 커맨드 (Nation Commands) - 41/41 ✅

- [x] cr\_인구이동 → `NationMigratePopulationCommand.ts`
- [x] che\_수몰 → `NationFloodCommand.ts`
- [x] event\_대검병연구 → `NationResearchGreatswordCommand.ts`
- [x] che\_포상 → `NationRewardCommand.ts`
- [x] che\_몰수 → `NationConfiscateCommand.ts`
- [x] che\_종전수락 → `NationAcceptPeaceCommand.ts`
- [x] event\_극병연구 → `NationResearchHalberdCommand.ts`
- [x] che\_발령 → `NationAppointCommand.ts`
- [x] event\_무희연구 → `NationResearchDancerCommand.ts`
- [x] che\_부대탈퇴지시 → `NationExpelFromTroopCommand.ts`
- [x] che\_불가침파기제의 → `NationBreakNonAggressionCommand.ts`
- [x] event\_화시병연구 → `NationResearchFireArcherCommand.ts`
- [x] che\_필사즉생 → `NationDesperateCommand.ts`
- [x] event\_음귀병연구 → `NationResearchShamanCommand.ts`
- [x] che\_물자원조 → `NationAidCommand.ts`
- [x] che\_의병모집 → `NationRecruitMilitiaCommand.ts`
- [x] che\_증축 → `NationExpandCapitalCommand.ts`
- [x] che\_종전제의 → `NationProposePeaceCommand.ts`
- [x] che\_천도 → `NationChangeCapitalCommand.ts`
- [x] che\_백성동원 → `NationMobilizeCommand.ts`
- [x] che\_국기변경 → `NationChangeColorCommand.ts`
- [x] che\_감축 → `NationReduceCapitalCommand.ts`
- [x] che\_국호변경 → `NationChangeNameCommand.ts`
- [x] che\_불가침제의 → `NationProposeNonAggressionCommand.ts`
- [x] che\_불가침수락 → `NationAcceptNonAggressionCommand.ts`
- [x] che\_불가침파기수락 → `NationAcceptBreakNonAggressionCommand.ts`
- [x] event\_산저병연구 → `NationResearchMountaineerCommand.ts`
- [x] event\_등애병연구 → `NationResearchElephantCommand.ts`
- [x] event\_등갑병연구 → `NationResearchRatanCommand.ts`
- [x] event\_거대기계연구 → `NationResearchJuggernautCommand.ts`
- [x] che\_선전포고 → `NationDeclareWarCommand.ts`
- [x] che\_세율조정 → `NationAdjustTaxCommand.ts`
- [x] che\_동맹제의 → `NationProposeAllianceCommand.ts`
- [x] che\_동맹수락 → `NationAcceptAllianceCommand.ts`
- [x] che\_청야 → `NationScorchedEarthCommand.ts`
- [x] che\_기습 → `NationRaidCommand.ts`
- [x] che\_허위보고 → `NationFalseReportCommand.ts`
- [x] che\_보복공격 → `NationRetaliationCommand.ts`
- [x] che\_국가휴식 → `NationRestCommand.ts`
- [x] che\_경제전쟁 → `NationEconomicWarfareCommand.ts`
- [x] che\_무작위천도 → `NationRandomCapitalCommand.ts`

---

## 2. 프론트엔드 페이지 - 18/18 ✅

### 게임 페이지 (apps/web/src/app/(game)/)

- [x] PageFront → `page.tsx` (Dashboard)
- [x] PageAuction → `auction/page.tsx`
- [x] PageBattleCenter → `battle-center/page.tsx`
- [x] PageBoard → `board/[type]/page.tsx`
- [x] PageTournament → `tournament/page.tsx`
- [x] PageHistory → `history/page.tsx`
- [x] PageNationBetting → `betting/page.tsx`
- [x] PageVote → `vote/page.tsx`
- [x] PageTroop → `troop/page.tsx`
- [x] PageNPCControl → `npc-control/page.tsx`
- [x] PageNationGeneral → `nation/generals/page.tsx`
- [x] PageNationStratFinan → `nation/finance/page.tsx`
- [x] PageJoin → `join/page.tsx`
- [x] PageInheritPoint → `inherit/page.tsx`
- [x] PageGlobalDiplomacy → `diplomacy/page.tsx`
- [x] PageChiefCenter → `chief/page.tsx`
- [x] PageCachedMap → `cached-map/page.tsx`
- [x] PageGeneralDetail → `general/[id]/page.tsx`

---

## 3. 전투 시스템 (WarEngine) - 100% ✅

### 전투 특기 트리거 (WarUnit Triggers) - 38/38

모든 전투 특기 트리거가 `WarUnitTriggerRegistry` 기반으로 포팅 완료.

- [x] 필살발동, 회피발동, 계략발동, 선제사격, 저격, 반계
- [x] 약탈, 위압, 불굴, 격노, 집중, 신산
- [x] 병종별 특수 어빌리티 트리거 통합

### Constraints - 73/73

모든 제약 조건이 `packages/logic/src/domain/constraints/`에 포팅 완료.

---

## 4. 아이템 시스템 - 161/161 ✅

모든 ActionItem 클래스가 `packages/logic/src/domain/items/`에 포팅 완료.

- [x] 무기류 (weapons/)
- [x] 서적류 (books/)
- [x] 유니크류 (unique/)
- [x] 말류 (horses/)

---

## 5. 시스템 구현 상태

> 아래 항목은 **구현 파일 기준으로 존재 여부**를 반영합니다.
> (기능적 1:1 패리티/실서비스 연동 여부는 `docs/remaining-work.md`의 체크리스트를 따릅니다.)

### 경매 시스템 - 100% ✅

- [x] `BaseAuction.ts` - 기본 경매 추상 클래스
- [x] `AuctionFactory.ts` - 경매 팩토리
- [x] `AuctionBuyRice.ts` - 쌀 구매 경매
- [x] `AuctionSellRice.ts` - 쌀 판매 경매
- [x] `AuctionUniqueItem.ts` - 유니크 아이템 경매
- [x] `AuctionBasicResource.ts` - 기본 자원 경매
- [x] 프론트엔드 페이지 (`apps/web/src/app/(game)/auction/page.tsx`)

### 베팅 시스템 - 100% ✅

- [x] `Betting.ts` - 베팅 서비스
- [x] `types.ts` - 타입 정의
- [x] 프론트엔드 페이지 (`apps/web/src/app/(game)/betting/page.tsx`)

### 상속 포인트 시스템 - 100% ✅

- [x] `InheritancePointManager.ts` - 상속 포인트 관리
- [x] `types.ts` - 타입 정의
- [x] 테스트 (`inheritance.test.ts`)
- [x] 프론트엔드 페이지 (`apps/web/src/app/(game)/inherit/page.tsx`)

### 토너먼트 시스템 - 100% ✅

- [x] `TournamentService.ts` - 토너먼트 서비스
- [x] `types.ts` - 타입 정의
- [x] 테스트 (`tournament.test.ts`)
- [x] 프론트엔드 페이지 (`apps/web/src/app/(game)/tournament/page.tsx`)

---

## 6. 패리티 테스트 인프라

- [x] `docker/parity-bridge/` - 레거시/TS 패리티 비교 브릿지
- [x] `packages/logic/src/parity/ParityTestRunner.ts` - 패리티 테스트 러너
- [x] `packages/logic/src/parity/types.ts` - 패리티 타입 정의

---

## 참조

- 커맨드 코드: `packages/logic/src/domain/commands/index.ts`
- 프론트엔드: `apps/web/src/app/(game)/`
- 트리거: `packages/logic/src/domain/triggers/war/`
- 경매: `packages/logic/src/domain/auction/`
- 베팅: `packages/logic/src/domain/betting/`
- 상속: `packages/logic/src/domain/inheritance/`
- 토너먼트: `packages/logic/src/domain/tournament/`
- 아이템: `packages/logic/src/domain/items/`
- 아이템: `packages/logic/src/domain/items/`
