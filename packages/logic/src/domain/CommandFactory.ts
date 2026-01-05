import { Command } from './Command.js';
import { GeneralRestCommand } from './commands/GeneralRestCommand.js';
import { GeneralTrainingCommand } from './commands/GeneralTrainingCommand.js';
import { GeneralDomesticSkillResetCommand, GeneralWarSkillResetCommand } from './commands/GeneralSpecialResetCommand.js';
import { GeneralDevelopAgricultureCommand } from './commands/GeneralDevelopAgricultureCommand.js';
import { GeneralDevelopCommerceCommand } from './commands/GeneralDevelopCommerceCommand.js';
import { GeneralReinforceSecurityCommand } from './commands/GeneralReinforceSecurityCommand.js';
import { GeneralRepairWallCommand } from './commands/GeneralRepairWallCommand.js';
import { GeneralMoveCommand } from './commands/GeneralMoveCommand.js';
import { GeneralRecruitCommand } from './commands/GeneralRecruitCommand.js';
import { GeneralTalentSearchCommand } from './commands/GeneralTalentSearchCommand.js';
import { NationRewardCommand } from './commands/NationRewardCommand.js';
import { NationChangeNameCommand } from './commands/NationChangeNameCommand.js';
import { NationChangeColorCommand } from './commands/NationChangeColorCommand.js';
import { NationChangeCapitalCommand } from './commands/NationChangeCapitalCommand.js';
import { NationConfiscateCommand } from './commands/NationConfiscateCommand.js';
import { GeneralDraftCommand } from './commands/GeneralDraftCommand.js';
import { GeneralConscriptCommand } from './commands/GeneralConscriptCommand.js';
import { GeneralTradeCommand } from './commands/GeneralTradeCommand.js';
import { GeneralTransportCommand } from './commands/GeneralTransportCommand.js';
import { GeneralWarCommand } from './commands/GeneralWarCommand.js';
import { GeneralReturnCommand } from './commands/GeneralReturnCommand.js';
import { GeneralResignCommand } from './commands/GeneralResignCommand.js';
import { GeneralJoinNationCommand } from './commands/GeneralJoinNationCommand.js';
import { GeneralDischargeCommand } from './commands/GeneralDischargeCommand.js';
import { GeneralFireAttackCommand } from './commands/GeneralFireAttackCommand.js';
import { GeneralForcedMarchCommand } from './commands/GeneralForcedMarchCommand.js';
import { GeneralAgitateCommand } from './commands/GeneralAgitateCommand.js';
import { GeneralDisciplineCommand } from './commands/GeneralDisciplineCommand.js';
import { GeneralFoundNationCommand } from './commands/GeneralFoundNationCommand.js';
import { GeneralRaiseArmyCommand } from './commands/GeneralRaiseArmyCommand.js';
import { GeneralResearchTechCommand } from './commands/GeneralResearchTechCommand.js';
import { GeneralEncourageCommand } from './commands/GeneralEncourageCommand.js';
import { GeneralStrengthenDefenseCommand } from './commands/GeneralStrengthenDefenseCommand.js';
import { GeneralAssembleCommand } from './commands/GeneralAssembleCommand.js';

/**
 * 커맨드 팩토리
 * 액션 코드에 해당하는 도메인 커맨드 객체를 반환함
 */
export class CommandFactory {
  public static create(actionCode: string): Command {
    switch (actionCode) {
      case '휴식':
      case 'che_휴식':
        return new GeneralRestCommand();
      case '훈련':
      case 'che_훈련':
        return new GeneralTrainingCommand();
      case '내정특기초기화':
      case 'che_내정특기초기화':
        return new GeneralDomesticSkillResetCommand();
      case '전투특기초기화':
      case 'che_전투특기초기화':
        return new GeneralWarSkillResetCommand();
      case '농지개간':
      case 'che_농지개간':
        return new GeneralDevelopAgricultureCommand();
      case '상업투자':
      case 'che_상업투자':
        return new GeneralDevelopCommerceCommand();
      case '치안강화':
      case 'che_치안강화':
        return new GeneralReinforceSecurityCommand();
      case '성벽보수':
      case 'che_성벽보수':
        return new GeneralRepairWallCommand();
      case '모병':
      case 'che_모병':
        return new GeneralDraftCommand();
      case '징병':
      case 'che_징병':
        return new GeneralConscriptCommand();
      case '매매':
      case 'che_매매':
        return new GeneralTradeCommand();
      case '수송':
      case 'che_수송':
        return new GeneralTransportCommand();
      case '출격':
      case 'che_출격':
        return new GeneralWarCommand();
      case '화계':
      case 'che_화계':
        return new GeneralFireAttackCommand();
      case '강행':
      case 'che_강행':
        return new GeneralForcedMarchCommand();
      case '선동':
      case 'che_선동':
        return new GeneralAgitateCommand();
      case '건국':
      case 'che_건국':
        return new GeneralFoundNationCommand();
      case '거병':
      case 'che_거병':
        return new GeneralRaiseArmyCommand();
      case '기술연구':
      case 'che_기술연구':
        return new GeneralResearchTechCommand();
      case '사기진작':
      case 'che_사기진작':
        return new GeneralEncourageCommand();
      case '수비강화':
      case 'che_수비강화':
        return new GeneralStrengthenDefenseCommand();
      case '집합':
      case 'che_집합':
        return new GeneralAssembleCommand();
      case '귀환':
      case 'che_귀환':
        return new GeneralReturnCommand();

      case '하야':
      case 'che_하야':
        return new GeneralResignCommand();
      case '임관':
      case 'che_임관':
        return new GeneralJoinNationCommand();
      case '소집해제':
      case 'che_소집해제':
        return new GeneralDischargeCommand();
      case '이동':
      case 'che_이동':
        return new GeneralMoveCommand();
      case '등용':
      case 'che_등용':
        return new GeneralRecruitCommand();
      case '인재탐색':
      case 'che_인재탐색':
        return new GeneralTalentSearchCommand();
      case '포상':
      case 'che_포상':
        return new NationRewardCommand();
      case '몰수':
      case 'che_몰수':
        return new NationConfiscateCommand();
      case '천도':
      case 'che_천도':
        return new NationChangeCapitalCommand();
      default:
        // 알 수 없는 커맨드는 기본적으로 휴식 처리
        return new GeneralRestCommand();
    }
  }
}

