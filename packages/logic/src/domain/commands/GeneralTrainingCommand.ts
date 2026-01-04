import { RandUtil } from '@sammo-ts/common';
import { GameConst } from '../GameConst.js';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { General } from '../models/General.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 훈련 커맨드
 * 레거시: che_훈련
 */
export class GeneralTrainingCommand extends GeneralCommand {
  readonly actionName = '훈련';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ReqGeneralCrew(),
      ConstraintHelper.ReqGeneralTrainMargin(100), // GameConst.maxTrainByCommand
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`훈련 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);
// ...existing code...

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const generalDelta = general.train(iGeneral.leadership);

    // 훈련치 상승분 계산 (로그용)
    const score = (generalDelta.train ?? iGeneral.train) - iGeneral.train;
    const atmosScore = (generalDelta.atmos ?? iGeneral.atmos) - iGeneral.atmos;

    return {
      generals: {
        [actorId]: generalDelta,
      },
      logs: {
        general: {
          [actorId]: [`훈련치가 ${score}, 사기가 ${atmosScore} 상승했습니다.`],
        },
      },
    };
  }
}
