import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { General } from '../models/General.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 물자조달 커맨드
 * 레거시: che_물자조달
 */
export class GeneralSupplyCommand extends GeneralCommand {
  readonly actionName = '물자조달';

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.NotWanderingNation(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return { logs: { general: { [actorId]: [`물자조달 실패: ${check.reason}`] } } };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iCity = snapshot.cities[iGeneral.cityId];
    if (!iCity) throw new Error(`도시 ${iGeneral.cityId}를 찾을 수 없습니다.`);

    const iNation = snapshot.nations[iGeneral.nationId];
    if (!iNation) throw new Error(`국가 ${iGeneral.nationId}를 찾을 수 없습니다.`);

    // Randomly choose resource type
    const resourceTypes = [
      { name: '금', key: 'gold' as const },
      { name: '쌀', key: 'rice' as const },
    ];
    const { name: resName, key: resKey } = rng.choice(resourceTypes);

    // Calculate base score
    const general = new General(iGeneral);
    let score = (iGeneral.leadership ?? 0) + (iGeneral.strength ?? 0) + (iGeneral.intel ?? 0);

    // Apply experience level bonus (TODO: implement getDomesticExpLevelBonus)
    // For now, using a simplified calculation based on experience
    const expBonus = 1 + Math.min(Math.floor((iGeneral.experience ?? 0) / 10000), 10) * 0.05;
    score *= expBonus;

    // Apply random variance
    score *= rng.nextRange(0.8, 1.2);

    // Calculate success/fail ratios
    const successRatio = 0.1;
    const failRatio = 0.3;
    const normalRatio = 1 - failRatio - successRatio;

    // Pick outcome
    const pick = rng.choiceUsingWeight({
      fail: failRatio,
      success: successRatio,
      normal: normalRatio,
    });

    // Apply critical multiplier
    const criticalMultipliers = {
      fail: 0.5,
      normal: 1.0,
      success: 1.5,
    };
    score *= criticalMultipliers[pick];

    // Apply front line debuff if applicable
    let debuffFront = 1.0;
    if (iCity.front === 1 || iCity.front === 3) {
      debuffFront = 0.5;

      // Capital gets reduced debuff in early game
      if (iNation.capitalCityId === iCity.id) {
        // TODO: Check relative year for debuff scaling
        // For now, apply full debuff
      }

      score *= debuffFront;
    }

    score = Math.round(score);

    // Calculate experience and dedication
    const exp = Math.round((score * 0.7) / 3);
    const ded = Math.round((score * 1.0) / 3);

    // Randomly increase one stat
    const stats = ['leadership', 'strength', 'intel'] as const;
    const weights = {
      leadership: iGeneral.leadership ?? 1,
      strength: iGeneral.strength ?? 1,
      intel: iGeneral.intel ?? 1,
    };
    const incStat = rng.choiceUsingWeight(weights);

    const generalDelta = {
      experience: (iGeneral.experience ?? 0) + exp,
      dedication: (iGeneral.dedication ?? 0) + ded,
      [`${incStat}Exp`]: ((iGeneral as any)[`${incStat}Exp`] ?? 0) + 1,
    };

    const nationDelta = {
      [iGeneral.nationId]: {
        [resKey]: (iNation[resKey] ?? 0) + score,
      },
    };

    const scoreText = score.toLocaleString();
    let logMessage = '';
    if (pick === 'fail') {
      logMessage = `조달을 실패하여 ${resName}을 ${scoreText} 조달했습니다.`;
    } else if (pick === 'success') {
      logMessage = `조달을 성공하여 ${resName}을 ${scoreText} 조달했습니다.`;
    } else {
      logMessage = `${resName}을 ${scoreText} 조달했습니다.`;
    }

    return {
      generals: { [actorId]: generalDelta },
      nations: nationDelta,
      logs: {
        general: { [actorId]: [logMessage] },
      },
    };
  }
}
