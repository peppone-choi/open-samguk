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
import { GeneralDraftCommand } from './commands/GeneralDraftCommand.js';
import { GeneralConscriptCommand } from './commands/GeneralConscriptCommand.js';
import { GeneralTradeCommand } from './commands/GeneralTradeCommand.js';
import { GeneralTransportCommand } from './commands/GeneralTransportCommand.js';
import { GeneralWarCommand } from './commands/GeneralWarCommand.js';
import { GeneralReturnCommand } from './commands/GeneralReturnCommand.js';
import { GeneralResignCommand } from './commands/GeneralResignCommand.js';
import { GeneralJoinNationCommand } from './commands/GeneralJoinNationCommand.js';
import { GeneralDischargeCommand } from './commands/GeneralDischargeCommand.js';

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
      default:
        // 알 수 없는 커맨드는 기본적으로 휴식 처리
        return new GeneralRestCommand();
    }
  }
}

