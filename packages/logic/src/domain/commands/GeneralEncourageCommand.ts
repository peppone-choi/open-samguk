import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { General } from '../models/General.js';
import { ConstraintHelper } from '../ConstraintHelper.js';
import { GameConst } from '../GameConst.js';

/**
 * 사기 진작 커맨드
 * 레거시: che_사기진작
 */
export class GeneralEncourageCommand extends GeneralCommand {
  readonly actionName = '사기진작';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ReqGeneralCrew(),
      ConstraintHelper.ReqGeneralAtmosMargin(GameConst.maxAtmosByCommand),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    // 레거시 비용 계산: 병사 / 100
    const reqGold = Math.max(Math.round(iGeneral.crew / 100), 1);
    
    // 제약 조건 검사
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`사기진작 실패: ${check.reason}`],
          },
        },
      };
    }

    if (iGeneral.gold < reqGold) {
        return {
            logs: {
                general: {
                    [actorId]: [`사기진작 실패: 자금이 부족합니다. (필요: ${reqGold})`],
                },
            },
        };
    }

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const { delta: generalDelta, atmosGain } = general.encourage(iGeneral.leadership);

    // 비용 소모
    generalDelta.gold = iGeneral.gold - reqGold;

    return {
      generals: {
        [actorId]: generalDelta,
      },
      logs: {
        general: {
          [actorId]: [`사기를 진작시켜 사기치가 ${atmosGain} 상승했습니다. (소모 금: ${reqGold})`],
        },
      },
    };
  }
}