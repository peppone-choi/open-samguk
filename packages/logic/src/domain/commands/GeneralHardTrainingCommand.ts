import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';
import { GameConst } from '../GameConst.js';

/**
 * 맹훈련 커맨드 - 훈련과 사기를 동시에 올리는 강화 훈련
 * 레거시: cr_맹훈련
 */
export class GeneralHardTrainingCommand extends GeneralCommand {
  readonly actionName = '맹훈련';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
    ];
  }

  getCost(): { gold: number; rice: number } {
    return { gold: 0, rice: 500 };
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`맹훈련 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];

    if (!iGeneral.crew || iGeneral.crew <= 0) {
      return {
        logs: {
          general: { [actorId]: ['맹훈련 실패: 병사가 없습니다.'] },
        },
      };
    }

    // 훈련/사기 상승량 계산
    const score = Math.round(
      (iGeneral.leadership * 100 / iGeneral.crew) * GameConst.trainDelta * 2 / 3
    );

    const newTrain = Math.min(iGeneral.train + score, GameConst.maxTrainByCommand);
    const newAtmos = Math.min(iGeneral.atmos + score, GameConst.maxAtmosByCommand);

    const exp = 150;
    const ded = 100;

    return {
      generals: {
        [actorId]: {
          train: newTrain,
          atmos: newAtmos,
          experience: iGeneral.experience + exp,
          dedication: iGeneral.dedication + ded,
          rice: iGeneral.rice - 500,
        },
      },
      logs: {
        general: {
          [actorId]: [`훈련, 사기치가 ${score} 상승했습니다.`],
        },
      },
    };
  }
}
