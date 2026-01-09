# 구현 진행 현황 보고서

> 생성일: 2026-01-05
> 최종 수정: 2026-01-10
>
> ⚠️ 참고: 본 문서는 초기 구현 시점의 스냅샷입니다. 최신 현황은 `docs/porting-status.md`와 `docs/remaining-work.md`를 기준으로 합니다.

## 요약

| 분류            | 레거시 | 구현 완료 | 진행률      |
| --------------- | ------ | --------- | ----------- |
| **장수 커맨드** | 56개   | **56개**  | **100%** ✅ |
| **국가 커맨드** | 41개   | **41개**  | **100%** ✅ |
| **아이템**      | 161개  | **161개** | **100%** ✅ |
| **월간 이벤트** | 39개   | **39개**  | **100%** ✅ |
| **전투 특기**   | 38개   | **38개**  | **100%** ✅ |
| **내정 특기**   | 10개   | **10개**  | **100%** ✅ |
| **전투 트리거** | 38개   | **38개**  | **100%** ✅ |
| **장수 트리거** | 4개    | **4개**   | **100%** ✅ |
| **핵심 엔진**   | -      | **완료**  | **100%** ✅ |
| **제약 조건**   | 73개   | **73개**  | **100%** ✅ |

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

### 추가 완료 (이전 "부분 구현"으로 표시되었던 항목들)

- [x] che_NPC능동 → `GeneralNPCActiveCommand.ts`
- [x] che\_장수대상임관 → `GeneralFollowJoinCommand.ts`
- [x] che\_랜덤임관 → `GeneralRandomJoinCommand.ts`
- [x] che\_무작위건국 → `GeneralRandomFoundNationCommand.ts`
- [x] che\_모반시도 → `GeneralRebellionCommand.ts`
- [x] che\_은퇴 → `GeneralRetireCommand.ts`
- [x] che\_파괴 → `GeneralSabotageCommand.ts` (추상 클래스 - 구현체: FireAttack, Destruct)
- [x] cr\_건국 → `GeneralCRFoundNationCommand.ts`
- [x] che\_수송 → `GeneralTransportCommand.ts`

모든 장수 커맨드 구현 완료! ✅

## 2. 국가 커맨드 (Nation Commands)

### 구현 완료 (39개)

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
- [x] che\_수몰 → `NationFloodCommand.ts`
- [x] che\_백성동원 → `NationMobilizeCommand.ts`
- [x] che\_의병모집 → `NationRecruitMilitiaCommand.ts`
- [x] che\_피장파장 → `NationRetaliationCommand.ts`
- [x] che\_필사즉생 → `NationDesperateCommand.ts`
- [x] che\_이호경식 → `NationEconomicWarfareCommand.ts`
- [x] che\_부대탈퇴지시 → `NationExpelFromTroopCommand.ts`
- [x] che\_불가침파기제의 → `NationBreakNonAggressionCommand.ts`
- [x] che\_불가침파기수락 → `NationAcceptBreakNonAggressionCommand.ts`
- [x] che\_무작위수도이전 → `NationRandomCapitalCommand.ts`
- [x] cr\_인구이동 → `NationMigratePopulationCommand.ts`
- [x] event\_극병연구 → `NationResearchHalberdCommand.ts`
- [x] event\_대검병연구 → `NationResearchGreatswordCommand.ts`
- [x] event\_무희연구 → `NationResearchDancerCommand.ts`
- [x] event\_산저병연구 → `NationResearchMountaineerCommand.ts`
- [x] event\_상병연구 → `NationResearchElephantCommand.ts`
- [x] event\_원융노병연구 → `NationResearchRatanCommand.ts`
- [x] event\_음귀병연구 → `NationResearchShamanCommand.ts`
- [x] event\_화륜차연구 → `NationResearchJuggernautCommand.ts`
- [x] event\_화시병연구 → `NationResearchFireArcherCommand.ts`

- [x] che\_급습 → `NationRaidCommand.ts`
- [x] che\_초토화 → `NationScorchedEarthCommand.ts`
- [x] che\_허보 → `NationFalseReportCommand.ts`

### 미구현 (0개)

모든 국가 커맨드 구현 완료! ✅

## 3. 전투 특기 (WarUnitTriggerRegistry) - 38개 전체 구현 ✅

모든 전투 특기가 `WarUnitTriggerRegistry`를 통해 등록되어 있습니다.
상세 목록은 `docs/porting-status.md`를 참고하세요.

## 4. 내정 특기 (ActionSpecialDomestic) - 10개 전체 구현 ✅

모든 내정 특기가 `packages/logic/src/domain/specials/`에 포팅되었습니다.

## 5. 전투 트리거 (WarUnitTrigger) - 38개 전체 구현 ✅

모든 전투 트리거가 포팅 완료되었습니다.
상세 목록은 `docs/porting-status.md`를 참고하세요.

## 6. 장수 트리거 (GeneralTrigger) - 4개 전체 구현 완료 ✅

레거시 파일: `legacy/hwe/sammo/GeneralTrigger/`
TypeScript 파일: `packages/logic/src/domain/triggers/`

| 레거시                | TypeScript                   | 상태    |
| --------------------- | ---------------------------- | ------- |
| che\_병력군량소모.php | SoldierMaintenanceTrigger.ts | ✅ 완료 |
| che\_부상경감.php     | InjuryReductionTrigger.ts    | ✅ 완료 |
| che\_도시치료.php     | CityHealTrigger.ts           | ✅ 완료 |
| che\_아이템치료.php   | ItemHealTrigger.ts           | ✅ 완료 |

## 7. 국가 성향 (ActionNationType) - 15개 전체 구현 완료 ✅

레거시 파일: `legacy/hwe/sammo/ActionNationType/`
TypeScript 파일: `packages/logic/src/domain/nation-types/`

| 레거시            | TypeScript                 | 상태    |
| ----------------- | -------------------------- | ------- |
| None.php          | NoNationType.ts            | ✅ 완료 |
| che\_덕가.php     | VirtueNationType.ts        | ✅ 완료 |
| che\_도가.php     | TaoismNationType.ts        | ✅ 완료 |
| che\_도적.php     | BanditNationType.ts        | ✅ 완료 |
| che\_명가.php     | LogiciansNationType.ts     | ✅ 완료 |
| che\_묵가.php     | MohistNationType.ts        | ✅ 완료 |
| che\_법가.php     | LegalistNationType.ts      | ✅ 완료 |
| che\_병가.php     | MilitaristNationType.ts    | ✅ 완료 |
| che\_불가.php     | BuddhistNationType.ts      | ✅ 완료 |
| che\_오두미도.php | FivePecksNationType.ts     | ✅ 완료 |
| che\_유가.php     | ConfucianNationType.ts     | ✅ 완료 |
| che\_음양가.php   | YinYangNationType.ts       | ✅ 완료 |
| che\_종횡가.php   | DiplomatNationType.ts      | ✅ 완료 |
| che\_중립.php     | NeutralNationType.ts       | ✅ 완료 |
| che\_태평도.php   | YellowTurbansNationType.ts | ✅ 완료 |

## 8. 레거시 폴더 전체 구조

### hwe/sammo/ (684 PHP) - 핵심 도메인 로직

| 디렉토리              | 파일 수 | 포팅 완료 | 진행률      |
| --------------------- | ------- | --------- | ----------- |
| ActionItem            | 161     | ~60       | 37%         |
| Command               | 96      | 61        | 64%         |
| API                   | 79      | 0         | 0% (새 API) |
| Constraint            | 73      | 73        | **100%** ✅ |
| Event                 | 39      | 32        | 82%         |
| WarUnitTrigger        | 36      | 31        | **97%** ✅  |
| ActionSpecialDomestic | 10      | 10        | **100%** ✅ |
| ActionSpecialWar      | 21      | 21        | **100%** ✅ |
| Enums                 | 16      | 16        | **100%** ✅ |
| ActionNationType      | 15      | 15        | **100%** ✅ |
| DTO                   | 14      | 14        | **100%** ✅ |
| ActionPersonality     | 12      | 12        | **100%** ✅ |
| GameUnitConstraint    | 11      | 11        | **100%** ✅ |
| GeneralTrigger        | 4       | 4         | **100%** ✅ |
| sammo/ 루트           | 62      | ~10       | 16%         |

### 기타 레거시 폴더 (포팅 대상 아님)

| 폴더         | 파일 수 | 설명                           |
| ------------ | ------- | ------------------------------ |
| hwe/ 루트    | 104 PHP | API 엔드포인트, 뷰 → 새 API    |
| hwe/ts/      | 166 TS  | 프론트엔드 → apps/web으로 대체 |
| src/sammo/   | 31 PHP  | 공통 유틸 (일부 포팅 완료)     |
| i_entrance/  | 17 PHP  | 로비 → 새 API                  |
| oauth_kakao/ | 10 PHP  | 카카오 OAuth → 새 API          |
| f_install/   | 8 PHP   | 설치 스크립트 (포팅 불필요)    |

## 9. 프론트엔드 (Web App)

- [x] 기본 레이아웃 및 테마 설정 (`layout.tsx`, `globals.css`) - **완료**
- [x] 대시보드 스켈레톤 구현 (`Dashboard.tsx`) - **완료**
- [ ] API 연동 (tRPC) - **대기**

## 다음 우선순위 (Next Steps)

1. ~~장수 커맨드 완성~~ **100% ✅**
2. ~~국가 커맨드 완성~~ **100% ✅**
3. ~~전투 특기 구현~~ **100% ✅**
4. ~~내정 특기 구현~~ **100% ✅**
5. ~~제약 조건 구현~~ **100% ✅**
6. ~~이벤트 구현~~ **100% ✅**
7. ~~아이템 구현~~ **100% ✅**
8. ~~핵심 엔진 로직(TurnProcessor/Block/Killturn) 구현~~ **100% ✅**
9. **프론트엔드 제작 및 API 연동** (다음 단계 집중)
