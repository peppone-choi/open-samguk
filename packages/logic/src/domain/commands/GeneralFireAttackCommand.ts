import { RandUtil } from '@sammo-ts/common';
import { GeneralSabotageCommand } from './GeneralSabotageCommand.js';
import { City as ICity, Delta } from '../entities.js';
import { GameConst } from '../GameConst.js';

/**
 * 화계 커맨드
 * 레거시: che_화계
 */
export class GeneralFireAttackCommand extends GeneralSabotageCommand {
  override readonly actionName = '화계';
  override readonly statType = 'intel';

  override affectDestCity(rng: RandUtil, destCity: ICity): { cityDelta: Delta<ICity>, successMsg: string } {
    const agriDamage = Math.min(rng.nextRangeInt(GameConst.sabotageDamageMin, GameConst.sabotageDamageMax), destCity.agri);
    const commDamage = Math.min(rng.nextRangeInt(GameConst.sabotageDamageMin, GameConst.sabotageDamageMax), destCity.comm);

    const newAgri = destCity.agri - agriDamage;
    const newComm = destCity.comm - commDamage;

    return {
      cityDelta: {
        agri: newAgri,
        comm: newComm,
        state: 32, // 화계 상태 (임시)
      },
      successMsg: `도시의 농업이 ${agriDamage}, 상업이 ${commDamage}만큼 감소했습니다.`,
    };
  }
}
