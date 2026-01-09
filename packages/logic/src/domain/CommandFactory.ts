import { Command } from "./Command.js";
// General Commands
import { GeneralRestCommand } from "./commands/GeneralRestCommand.js";
import { GeneralTrainingCommand } from "./commands/GeneralTrainingCommand.js";
import {
  GeneralDomesticSkillResetCommand,
  GeneralWarSkillResetCommand,
} from "./commands/GeneralSpecialResetCommand.js";
import { GeneralDevelopAgricultureCommand } from "./commands/GeneralDevelopAgricultureCommand.js";
import { GeneralDevelopCommerceCommand } from "./commands/GeneralDevelopCommerceCommand.js";
import { GeneralReinforceSecurityCommand } from "./commands/GeneralReinforceSecurityCommand.js";
import { GeneralRepairWallCommand } from "./commands/GeneralRepairWallCommand.js";
import { GeneralMoveCommand } from "./commands/GeneralMoveCommand.js";
import { GeneralRecruitCommand } from "./commands/GeneralRecruitCommand.js";
import { GeneralTalentSearchCommand } from "./commands/GeneralTalentSearchCommand.js";
import { GeneralDraftCommand } from "./commands/GeneralDraftCommand.js";
import { GeneralConscriptCommand } from "./commands/GeneralConscriptCommand.js";
import { GeneralTradeCommand } from "./commands/GeneralTradeCommand.js";
import { GeneralTransportCommand } from "./commands/GeneralTransportCommand.js";
import { GeneralWarCommand } from "./commands/GeneralWarCommand.js";
import { GeneralReturnCommand } from "./commands/GeneralReturnCommand.js";
import { GeneralResignCommand } from "./commands/GeneralResignCommand.js";
import { GeneralJoinNationCommand } from "./commands/GeneralJoinNationCommand.js";
import { GeneralDischargeCommand } from "./commands/GeneralDischargeCommand.js";
import { GeneralFireAttackCommand } from "./commands/GeneralFireAttackCommand.js";
import { GeneralForcedMarchCommand } from "./commands/GeneralForcedMarchCommand.js";
import { GeneralAgitateCommand } from "./commands/GeneralAgitateCommand.js";
import { GeneralDisciplineCommand } from "./commands/GeneralDisciplineCommand.js";
import { GeneralFoundNationCommand } from "./commands/GeneralFoundNationCommand.js";
import { GeneralRaiseArmyCommand } from "./commands/GeneralRaiseArmyCommand.js";
import { GeneralResearchTechCommand } from "./commands/GeneralResearchTechCommand.js";
import { GeneralEncourageCommand } from "./commands/GeneralEncourageCommand.js";
import { GeneralStrengthenDefenseCommand } from "./commands/GeneralStrengthenDefenseCommand.js";
import { GeneralAssembleCommand } from "./commands/GeneralAssembleCommand.js";
import { GeneralConvertDexCommand } from "./commands/GeneralConvertDexCommand.js";
import { GeneralDevelopPopulationCommand } from "./commands/GeneralDevelopPopulationCommand.js";
import { GeneralDevelopTrustCommand } from "./commands/GeneralDevelopTrustCommand.js";
import { GeneralDonateCommand } from "./commands/GeneralDonateCommand.js";
import { GeneralEquipmentTradeCommand } from "./commands/GeneralEquipmentTradeCommand.js";
import { GeneralGiftCommand } from "./commands/GeneralGiftCommand.js";
import { GeneralNPCActiveCommand } from "./commands/GeneralNPCActiveCommand.js";
import { GeneralRecruitAcceptCommand } from "./commands/GeneralRecruitAcceptCommand.js";
import { GeneralRecuperateCommand } from "./commands/GeneralRecuperateCommand.js";
import { GeneralDestructCommand } from "./commands/GeneralDestructCommand.js";
import { GeneralSightseeingCommand } from "./commands/GeneralSightseeingCommand.js";
import { GeneralSpyCommand } from "./commands/GeneralSpyCommand.js";
import { GeneralWanderCommand } from "./commands/GeneralWanderCommand.js";
// 추가 General Commands
import { GeneralLootCommand } from "./commands/GeneralLootCommand.js";
import { GeneralRebellionCommand } from "./commands/GeneralRebellionCommand.js";
import { GeneralRetireCommand } from "./commands/GeneralRetireCommand.js";
import { GeneralHardTrainingCommand } from "./commands/GeneralHardTrainingCommand.js";
import { GeneralSupplyCommand } from "./commands/GeneralSupplyCommand.js";
import { GeneralDisbandCommand } from "./commands/GeneralDisbandCommand.js";
import { GeneralAbdicateCommand } from "./commands/GeneralAbdicateCommand.js";
import { GeneralBorderReturnCommand } from "./commands/GeneralBorderReturnCommand.js";
import { GeneralCombatReadinessCommand } from "./commands/GeneralCombatReadinessCommand.js";
// GeneralSabotageCommand는 추상 클래스로 직접 사용하지 않음 (FireAttack, Destruct, Loot의 베이스)
import { GeneralRandomJoinCommand } from "./commands/GeneralRandomJoinCommand.js";
import { GeneralFollowJoinCommand } from "./commands/GeneralFollowJoinCommand.js";
import { GeneralRandomFoundNationCommand } from "./commands/GeneralRandomFoundNationCommand.js";
import { GeneralCRFoundNationCommand } from "./commands/GeneralCRFoundNationCommand.js";

// Nation Commands
import { NationRewardCommand } from "./commands/NationRewardCommand.js";
import { NationChangeNameCommand } from "./commands/NationChangeNameCommand.js";
import { NationChangeColorCommand } from "./commands/NationChangeColorCommand.js";
import { NationChangeCapitalCommand } from "./commands/NationChangeCapitalCommand.js";
import { NationConfiscateCommand } from "./commands/NationConfiscateCommand.js";
import { NationDeclareWarCommand } from "./commands/NationDeclareWarCommand.js";
import { NationProposePeaceCommand } from "./commands/NationProposePeaceCommand.js";
import { NationProposeAllianceCommand } from "./commands/NationProposeAllianceCommand.js";
import { NationProposeNonAggressionCommand } from "./commands/NationProposeNonAggressionCommand.js";
import { NationAcceptPeaceCommand } from "./commands/NationAcceptPeaceCommand.js";
import { NationAcceptAllianceCommand } from "./commands/NationAcceptAllianceCommand.js";
import { NationAcceptNonAggressionCommand } from "./commands/NationAcceptNonAggressionCommand.js";
import { NationAppointCommand } from "./commands/NationAppointCommand.js";
import { NationAidCommand } from "./commands/NationAidCommand.js";
// 추가 Nation Commands
import { NationRestCommand } from "./commands/NationRestCommand.js";
import { NationAdjustTaxCommand } from "./commands/NationAdjustTaxCommand.js";
import { NationExpandCapitalCommand } from "./commands/NationExpandCapitalCommand.js";
import { NationReduceCapitalCommand } from "./commands/NationReduceCapitalCommand.js";
import { NationFloodCommand } from "./commands/NationFloodCommand.js";
import { NationMobilizeCommand } from "./commands/NationMobilizeCommand.js";
import { NationRecruitMilitiaCommand } from "./commands/NationRecruitMilitiaCommand.js";
import { NationRetaliationCommand } from "./commands/NationRetaliationCommand.js";
import { NationDesperateCommand } from "./commands/NationDesperateCommand.js";
import { NationEconomicWarfareCommand } from "./commands/NationEconomicWarfareCommand.js";
import { NationExpelFromTroopCommand } from "./commands/NationExpelFromTroopCommand.js";
import { NationBreakNonAggressionCommand } from "./commands/NationBreakNonAggressionCommand.js";
import { NationAcceptBreakNonAggressionCommand } from "./commands/NationAcceptBreakNonAggressionCommand.js";
import { NationRandomCapitalCommand } from "./commands/NationRandomCapitalCommand.js";
import { NationMigratePopulationCommand } from "./commands/NationMigratePopulationCommand.js";
import { NationScorchedEarthCommand } from "./commands/NationScorchedEarthCommand.js";
import { NationRaidCommand } from "./commands/NationRaidCommand.js";
import { NationFalseReportCommand } from "./commands/NationFalseReportCommand.js";
// 특수 병종 연구 커맨드
import { NationResearchHalberdCommand } from "./commands/NationResearchHalberdCommand.js";
import { NationResearchGreatswordCommand } from "./commands/NationResearchGreatswordCommand.js";
import { NationResearchDancerCommand } from "./commands/NationResearchDancerCommand.js";
import { NationResearchMountaineerCommand } from "./commands/NationResearchMountaineerCommand.js";
import { NationResearchElephantCommand } from "./commands/NationResearchElephantCommand.js";
import { NationResearchRatanCommand } from "./commands/NationResearchRatanCommand.js";
import { NationResearchShamanCommand } from "./commands/NationResearchShamanCommand.js";
import { NationResearchJuggernautCommand } from "./commands/NationResearchJuggernautCommand.js";
import { NationResearchFireArcherCommand } from "./commands/NationResearchFireArcherCommand.js";

/**
 * 커맨드 팩토리
 * 액션 코드에 해당하는 도메인 커맨드 객체를 반환함
 */
export class CommandFactory {
  public static create(actionCode: string): Command {
    switch (actionCode) {
      case "휴식":
      case "che_휴식":
      case "rest":
        return new GeneralRestCommand();
      case "훈련":
      case "che_훈련":
      case "train":
        return new GeneralTrainingCommand();
      case "내정특기초기화":
      case "che_내정특기초기화":
        return new GeneralDomesticSkillResetCommand();
      case "전투특기초기화":
      case "che_전투특기초기화":
        return new GeneralWarSkillResetCommand();
      case "농지개간":
      case "che_농지개간":
        return new GeneralDevelopAgricultureCommand();
      case "상업투자":
      case "che_상업투자":
        return new GeneralDevelopCommerceCommand();
      case "치안강화":
      case "che_치안강화":
        return new GeneralReinforceSecurityCommand();
      case "성벽보수":
      case "che_성벽보수":
        return new GeneralRepairWallCommand();
      case "모병":
      case "che_모병":
        return new GeneralDraftCommand();
      case "징병":
      case "che_징병":
        return new GeneralConscriptCommand();
      case "매매":
      case "che_매매":
        return new GeneralTradeCommand();
      case "수송":
      case "che_수송":
        return new GeneralTransportCommand();
      case "출격":
      case "che_출격":
        return new GeneralWarCommand();
      case "화계":
      case "che_화계":
        return new GeneralFireAttackCommand();
      case "강행":
      case "che_강행":
        return new GeneralForcedMarchCommand();
      case "선동":
      case "che_선동":
        return new GeneralAgitateCommand();
      case "건국":
      case "che_건국":
        return new GeneralFoundNationCommand();
      case "거병":
      case "che_거병":
        return new GeneralRaiseArmyCommand();
      case "기술연구":
      case "che_기술연구":
        return new GeneralResearchTechCommand();
      case "사기진작":
      case "che_사기진작":
        return new GeneralEncourageCommand();
      case "수비강화":
      case "che_수비강화":
        return new GeneralStrengthenDefenseCommand();
      case "집합":
      case "che_집합":
        return new GeneralAssembleCommand();
      case "귀환":
      case "che_귀환":
        return new GeneralReturnCommand();

      case "숙련전환":
      case "che_숙련전환":
        return new GeneralConvertDexCommand();
      case "정착장려":
      case "che_정착장려":
        return new GeneralDevelopPopulationCommand();
      case "주민선정":
      case "che_주민선정":
        return new GeneralDevelopTrustCommand();
      case "헌납":
      case "che_헌납":
        return new GeneralDonateCommand();
      case "장비매매":
      case "che_장비매매":
        return new GeneralEquipmentTradeCommand();
      case "증여":
      case "che_증여":
        return new GeneralGiftCommand();
      case "NPC능동":
      case "che_NPC능동":
        return new GeneralNPCActiveCommand();
      case "등용수락":
      case "che_등용수락":
        return new GeneralRecruitAcceptCommand();
      case "요양":
      case "che_요양":
        return new GeneralRecuperateCommand();
      case "파괴":
      case "che_파괴":
        return new GeneralDestructCommand();
      case "견문":
      case "che_견문":
        return new GeneralSightseeingCommand();
      case "첩보":
      case "che_첩보":
        return new GeneralSpyCommand();
      case "방랑":
      case "che_방랑":
        return new GeneralWanderCommand();

      case "하야":
      case "che_하야":
        return new GeneralResignCommand();
      case "임관":
      case "che_임관":
        return new GeneralJoinNationCommand();
      case "소집해제":
      case "che_소집해제":
        return new GeneralDischargeCommand();
      case "이동":
      case "che_이동":
        return new GeneralMoveCommand();
      case "등용":
      case "che_등용":
        return new GeneralRecruitCommand();
      case "인재탐색":
      case "che_인재탐색":
        return new GeneralTalentSearchCommand();

      // 추가 장수 커맨드
      case "탈취":
      case "che_탈취":
        return new GeneralLootCommand();
      case "모반시도":
      case "che_모반시도":
        return new GeneralRebellionCommand();
      case "은퇴":
      case "che_은퇴":
        return new GeneralRetireCommand();
      case "맹훈련":
      case "cr_맹훈련":
        return new GeneralHardTrainingCommand();
      case "물자조달":
      case "che_물자조달":
        return new GeneralSupplyCommand();
      case "해산":
      case "che_해산":
        return new GeneralDisbandCommand();
      case "선양":
      case "che_선양":
        return new GeneralAbdicateCommand();
      case "접경귀환":
      case "che_접경귀환":
        return new GeneralBorderReturnCommand();
      case "전투태세":
      case "che_전투태세":
        return new GeneralCombatReadinessCommand();
      case "랜덤임관":
      case "che_랜덤임관":
        return new GeneralRandomJoinCommand();
      case "장수대상임관":
      case "che_장수대상임관":
        return new GeneralFollowJoinCommand();
      case "무작위건국":
      case "che_무작위건국":
        return new GeneralRandomFoundNationCommand();
      case "cr_건국":
        return new GeneralCRFoundNationCommand();

      // 국가 커맨드
      case "포상":
      case "che_포상":
      case "reward":
        return new NationRewardCommand();
      case "몰수":
      case "che_몰수":
      case "confiscate":
        return new NationConfiscateCommand();
      case "천도":
      case "che_천도":
      case "changeCapital":
        return new NationChangeCapitalCommand();
      case "발령":
      case "che_발령":
      case "dispatch":
        return new NationAppointCommand();
      case "선전포고":
      case "che_선전포고":
      case "declareWar":
        return new NationDeclareWarCommand();
      case "휴전제의":
      case "che_휴전제의":
      case "proposePeace":
        return new NationProposePeaceCommand();
      case "동맹제의":
      case "che_동맹제의":
      case "proposeAlliance":
        return new NationProposeAllianceCommand();
      case "불가침제의":
      case "che_불가침제의":
      case "proposeNonAggression":
        return new NationProposeNonAggressionCommand();
      case "국호변경":
      case "che_국호변경":
      case "changeName":
        return new NationChangeNameCommand();
      case "국색변경":
      case "che_국색변경":
      case "changeColor":
        return new NationChangeColorCommand();
      case "원조":
      case "che_원조":
      case "aid":
        return new NationAidCommand();

      // 추가 국가 커맨드
      case "국가휴식":
      case "che_국가휴식":
        return new NationRestCommand();
      case "세금조정":
      case "che_세금조정":
        return new NationAdjustTaxCommand();
      case "증축":
      case "che_증축":
        return new NationExpandCapitalCommand();
      case "감축":
      case "che_감축":
        return new NationReduceCapitalCommand();
      case "수몰":
      case "che_수몰":
        return new NationFloodCommand();
      case "백성동원":
      case "che_백성동원":
        return new NationMobilizeCommand();
      case "의병모집":
      case "che_의병모집":
        return new NationRecruitMilitiaCommand();
      case "피장파장":
      case "che_피장파장":
        return new NationRetaliationCommand();
      case "필사즉생":
      case "che_필사즉생":
        return new NationDesperateCommand();
      case "이호경식":
      case "che_이호경식":
        return new NationEconomicWarfareCommand();
      case "부대탈퇴지시":
      case "che_부대탈퇴지시":
        return new NationExpelFromTroopCommand();
      case "불가침파기제의":
      case "che_불가침파기제의":
        return new NationBreakNonAggressionCommand();
      case "불가침파기수락":
      case "che_불가침파기수락":
        return new NationAcceptBreakNonAggressionCommand();
      case "무작위수도이전":
      case "che_무작위수도이전":
        return new NationRandomCapitalCommand();
      case "인구이동":
      case "cr_인구이동":
        return new NationMigratePopulationCommand();
      case "초토화":
      case "che_초토화":
        return new NationScorchedEarthCommand();
      case "급습":
      case "che_급습":
        return new NationRaidCommand();
      case "허보":
      case "che_허보":
        return new NationFalseReportCommand();
      // 특수 병종 연구
      case "극병연구":
      case "event_극병연구":
        return new NationResearchHalberdCommand();
      case "대검병연구":
      case "event_대검병연구":
        return new NationResearchGreatswordCommand();
      case "무희연구":
      case "event_무희연구":
        return new NationResearchDancerCommand();
      case "산저병연구":
      case "event_산저병연구":
        return new NationResearchMountaineerCommand();
      case "상병연구":
      case "event_상병연구":
        return new NationResearchElephantCommand();
      case "원융노병연구":
      case "event_원융노병연구":
        return new NationResearchRatanCommand();
      case "음귀병연구":
      case "event_음귀병연구":
        return new NationResearchShamanCommand();
      case "화륜차연구":
      case "event_화륜차연구":
        return new NationResearchJuggernautCommand();
      case "화시병연구":
      case "event_화시병연구":
        return new NationResearchFireArcherCommand();

      default:
        // 알 수 없는 커맨드는 기본적으로 휴식 처리
        return new GeneralRestCommand();
    }
  }
}
