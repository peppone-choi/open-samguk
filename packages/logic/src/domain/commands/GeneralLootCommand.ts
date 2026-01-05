import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';
import { GameConst } from '../GameConst.js';

/**
 * 탈취 커맨드 - 적 도시에서 자원을 약탈
 * 레거시: che_탈취
 */
export class GeneralLootCommand extends GeneralCommand {
  readonly actionName = '탈취';

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`탈취 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destCityId } = args;
    if (!destCityId) {
      return {
        logs: {
          general: { [actorId]: ['탈취 실패: 대상 도시가 지정되지 않았습니다.'] },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const destCity = snapshot.cities[destCityId];

    if (!destCity) {
      return {
        logs: {
          general: { [actorId]: ['탈취 실패: 존재하지 않는 도시입니다.'] },
        },
      };
    }

    if (destCity.nationId === iGeneral.nationId) {
      return {
        logs: {
          general: { [actorId]: ['탈취 실패: 아국 도시입니다.'] },
        },
      };
    }

    if (destCity.nationId === 0) {
      return {
        logs: {
          general: { [actorId]: ['탈취 실패: 공백지입니다.'] },
        },
      };
    }

    // 탈취량 계산 (레거시 로직 간소화)
    const yearCoef = 1.0; // TODO: 연도 계수 적용
    const commRatio = destCity.commerce / (destCity.commerceMax || 100);
    const agriRatio = destCity.agriculture / (destCity.agricultureMax || 100);

    const gold = Math.round(
      rng.nextRangeInt(GameConst.sabotageDamageMin, GameConst.sabotageDamageMax) *
      destCity.level * yearCoef * (0.25 + commRatio / 4)
    );
    const rice = Math.round(
      rng.nextRangeInt(GameConst.sabotageDamageMin, GameConst.sabotageDamageMax) *
      destCity.level * yearCoef * (0.25 + agriRatio / 4)
    );

    const exp = 100;
    const ded = 70;

    return {
      generals: {
        [actorId]: {
          gold: iGeneral.gold + Math.round(gold * 0.3),
          rice: iGeneral.rice + Math.round(rice * 0.3),
          experience: iGeneral.experience + exp,
          dedication: iGeneral.dedication + ded,
        },
      },
      logs: {
        general: {
          [actorId]: [`${destCity.name}에 탈취가 성공했습니다. 금 ${gold.toLocaleString()}, 쌀 ${rice.toLocaleString()}을 획득했습니다.`],
        },
        global: [`${destCity.name}에서 금과 쌀을 도둑맞았습니다.`],
      },
    };
  }
}
