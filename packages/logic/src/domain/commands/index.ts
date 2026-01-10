/**
 * @fileoverview 게임 커맨드 모듈 인덱스
 *
 * 삼국지 모의전투에서 장수와 국가가 실행할 수 있는 모든 커맨드를 정의합니다.
 *
 * ## 커맨드 분류
 *
 * ### 장수 커맨드 (General~)
 * 개인 장수가 실행하는 행동으로, 턴마다 1회 실행됩니다.
 *
 * #### 기본 행동
 * - **휴식**: 아무 행동 없이 턴 종료
 * - **훈련**: 병사 훈련도 상승
 * - **요양**: 부상 회복
 * - **견문**: 경험치 및 특수 아이템 획득
 *
 * #### 내정 커맨드
 * - **농지개간**: 도시 농업 수치 상승
 * - **상업투자**: 도시 상업 수치 상승
 * - **치안강화**: 도시 치안 수치 상승
 * - **성벽보수**: 도시 성벽 수치 상승
 * - **정착장려**: 도시 인구 상승
 * - **주민선정**: 도시 민심 상승
 * - **기술연구**: 국가 기술력 상승
 * - **수비강화**: 도시 수비 수치 상승
 *
 * #### 군사 커맨드
 * - **모병/징병**: 병사 모집
 * - **출격**: 적 도시 공격
 * - **강행**: 이동 후 즉시 공격
 * - **화계**: 적 도시에 화공
 * - **파괴/탈취**: 적 도시 시설 파괴/약탈
 * - **전투태세**: 수비 준비
 * - **집합/해산**: 부대 관리
 *
 * #### 이동/외교
 * - **이동**: 인접 도시로 이동
 * - **귀환/접경귀환**: 수도 또는 접경 도시로 귀환
 * - **등용/인재탐색**: NPC 또는 재야 장수 영입
 * - **임관/하야**: 국가 가입/탈퇴
 * - **건국/거병**: 새 국가 설립
 *
 * #### 기타
 * - **매매**: 금/쌀 거래
 * - **수송**: 자원 수송
 * - **헌납/증여**: 자원 기부
 * - **선양**: 군주 자리 양도
 * - **은퇴**: 게임에서 은퇴
 *
 * ### 국가 커맨드 (Nation~)
 * 군주 또는 수뇌가 실행하는 국가 차원의 명령입니다.
 *
 * #### 외교
 * - **선전포고**: 전쟁 선포
 * - **휴전/동맹/불가침 제의/수락**: 외교 협정
 *
 * #### 인사/재정
 * - **포상/몰수**: 장수에게 자원 수여/회수
 * - **발령**: 관직 임명
 * - **세금조정**: 세율 변경
 * - **원조**: 타국에 자원 지원
 *
 * #### 전략
 * - **백성동원/의병모집**: 병력 동원
 * - **수몰/초토화**: 전략적 시설 파괴
 * - **피장파장/필사즉생/이호경식**: 특수 전략
 * - **급습/허보**: 기습 공격/정보 조작
 *
 * #### 수도 관리
 * - **천도**: 수도 이전
 * - **증축/감축**: 수도 규모 조절
 *
 * #### 특수병종 연구
 * - **극병/대검병/무희/산저병 등**: 특수 병종 해금
 *
 * @example
 * // 커맨드 사용 예시
 * import { GeneralTrainingCommand } from "./commands";
 *
 * const cmd = new GeneralTrainingCommand();
 * const delta = cmd.run(rng, snapshot, generalId, {});
 */
export * from "./GeneralAbdicateCommand.js";
export * from "./GeneralAgitateCommand.js";
export * from "./GeneralAssembleCommand.js";
export * from "./GeneralBorderReturnCommand.js";
export * from "./GeneralCombatReadinessCommand.js";
export * from "./GeneralConscriptCommand.js";
export * from "./GeneralConvertDexCommand.js";
export * from "./GeneralCRFoundNationCommand.js";
export * from "./GeneralDestructCommand.js";
export * from "./GeneralDevelopAgricultureCommand.js";
export * from "./GeneralDisbandCommand.js";
export * from "./GeneralDevelopCommerceCommand.js";
export * from "./GeneralDevelopPopulationCommand.js";
export * from "./GeneralDevelopTrustCommand.js";
export * from "./GeneralDischargeCommand.js";
export * from "./GeneralDisciplineCommand.js";
export * from "./GeneralDonateCommand.js";
export * from "./GeneralDraftCommand.js";
export * from "./GeneralEncourageCommand.js";
export * from "./GeneralEquipmentTradeCommand.js";
export * from "./GeneralFireAttackCommand.js";
export * from "./GeneralFollowJoinCommand.js";
export * from "./GeneralForcedMarchCommand.js";
export * from "./GeneralFoundNationCommand.js";
export * from "./GeneralGiftCommand.js";
export * from "./GeneralHardTrainingCommand.js";
export * from "./GeneralJoinNationCommand.js";
export * from "./GeneralLootCommand.js";
export * from "./GeneralMoveCommand.js";
export * from "./GeneralNPCActiveCommand.js";
export * from "./GeneralRandomJoinCommand.js";
export * from "./GeneralRaiseArmyCommand.js";
export * from "./GeneralRandomFoundNationCommand.js";
export * from "./GeneralRebellionCommand.js";
export * from "./GeneralRecruitAcceptCommand.js";
export * from "./GeneralRecruitCommand.js";
export * from "./GeneralRecuperateCommand.js";
export * from "./GeneralReinforceSecurityCommand.js";
export * from "./GeneralRepairWallCommand.js";
export * from "./GeneralResearchTechCommand.js";
export * from "./GeneralResignCommand.js";
export * from "./GeneralRestCommand.js";
export * from "./GeneralRetireCommand.js";
export * from "./GeneralReturnCommand.js";
export * from "./GeneralSabotageCommand.js";
export * from "./GeneralSightseeingCommand.js";
export * from "./GeneralSpecialResetCommand.js";
export * from "./GeneralSpyCommand.js";
export * from "./GeneralStrengthenDefenseCommand.js";
export * from "./GeneralSupplyCommand.js";
export * from "./GeneralTalentSearchCommand.js";
export * from "./GeneralTradeCommand.js";
export * from "./GeneralTrainingCommand.js";
export * from "./GeneralTransportCommand.js";
export * from "./GeneralWanderCommand.js";
export * from "./GeneralWarCommand.js";
export * from "./NationAcceptNonAggressionCommand.js";
export * from "./NationAcceptPeaceCommand.js";
export * from "./NationAidCommand.js";
export * from "./NationAppointCommand.js";
export * from "./NationChangeCapitalCommand.js";
export * from "./NationChangeColorCommand.js";
export * from "./NationChangeNameCommand.js";
export * from "./NationConfiscateCommand.js";
export * from "./NationDeclareWarCommand.js";
export * from "./NationExpandCapitalCommand.js";
export * from "./NationFloodCommand.js";
export * from "./NationProposeNonAggressionCommand.js";
export * from "./NationProposePeaceCommand.js";
export * from "./NationRaidCommand.js";
export * from "./NationProposeAllianceCommand.js";
export * from "./NationAcceptAllianceCommand.js";
export * from "./NationAdjustTaxCommand.js";
export * from "./NationReduceCapitalCommand.js";
export * from "./NationRestCommand.js";
export * from "./NationRewardCommand.js";
export * from "./NationScorchedEarthCommand.js";
export * from "./NationFalseReportCommand.js";
export * from "./NationRetaliationCommand.js";
export * from "./NationDesperateCommand.js";
export * from "./NationMobilizeCommand.js";
export * from "./NationRecruitMilitiaCommand.js";
export * from "./NationEconomicWarfareCommand.js";
export * from "./NationMigratePopulationCommand.js";
export * from "./NationBreakNonAggressionCommand.js";
export * from "./NationAcceptBreakNonAggressionCommand.js";
export * from "./NationRandomCapitalCommand.js";
export * from "./NationExpelFromTroopCommand.js";
export * from "./NationResearchHalberdCommand.js";
export * from "./NationResearchGreatswordCommand.js";
export * from "./NationResearchDancerCommand.js";
export * from "./NationResearchMountaineerCommand.js";
export * from "./NationResearchElephantCommand.js";
export * from "./NationResearchRatanCommand.js";
export * from "./NationResearchShamanCommand.js";
export * from "./NationResearchJuggernautCommand.js";
export * from "./NationResearchFireArcherCommand.js";
