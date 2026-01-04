import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 하야 커맨드
 * 레거시: che_하야
 */
export class GeneralResignCommand extends GeneralCommand {
  readonly actionName = '하야';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`하야 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iNation = snapshot.nations[iGeneral.nationId];

    return {
      generals: {
        [actorId]: {
          nationId: 0, // 중립
          officerLevel: 0,
          dedication: 0, // 하야 시 공헌도 초기화
        },
      },
      logs: {
        general: {
          [actorId]: [`${iNation.name}에서 하야하여 재야로 돌아갔습니다.`],
        },
        global: [`${iGeneral.name} 장수가 ${iNation.name}에서 하야했습니다.`],
      },
    };
  }
}
