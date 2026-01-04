import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { Nation } from '../models/Nation.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 포상 커맨드
 * 레거시: che_포상 (국가 커맨드이나 장수가 실행)
 */
export class NationRewardCommand extends GeneralCommand {
  readonly actionName = '포상';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.ReqOfficerLevel(1), // 군주 이상
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      // 대상 장수 존재 여부 등은 run에서 체크하거나 별도 제약 조건 필요
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`포상 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destGeneralId, amount, isGold } = args;
    if (destGeneralId === undefined || amount === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ['포상 실패: 대상 장수 또는 금액이 지정되지 않았습니다.'],
          },
        },
      };
    }

    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return {
        logs: {
          global: [`장수 ${actorId}를 찾을 수 없어 포상을 실행할 수 없습니다.`],
        },
      };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: {
            [actorId]: ['포상 실패: 소속 국가 정보를 찾을 수 없습니다.'],
          },
        },
      };
    }

    const iDestGeneral = snapshot.generals[destGeneralId];

    if (!iDestGeneral) {
      return {
        logs: {
          general: {
            [actorId]: ['포상 실패: 대상 장수를 찾을 수 없습니다.'],
          },
        },
      };
    }

    if (iDestGeneral.nationId !== iActor.nationId) {
      return {
        logs: {
          general: {
            [actorId]: ['포상 실패: 타국 장수에게는 포상할 수 없습니다.'],
          },
        },
      };
    }

    // DDD 도메인 모델 활용
    const nation = new Nation(iNation);
    const resKey = isGold ? 'gold' : 'rice';
    const resName = isGold ? '금' : '쌀';

    try {
      let nationDelta;
      if (isGold) {
        nationDelta = nation.withdrawGold(amount);
      } else {
        nationDelta = nation.withdrawRice(amount);
      }

      return {
        nations: {
          [iNation.id]: nationDelta
        },
        generals: {
          [destGeneralId]: {
            [resKey]: (iDestGeneral[resKey as 'gold' | 'rice'] as number) + amount
          },
          [actorId]: {
            experience: iActor.experience + 50,
            dedication: iActor.dedication + 100,
          }
        },
        logs: {
          general: {
            [actorId]: [`${iDestGeneral.name}에게 ${resName} ${amount}을 수여했습니다.`],
            [destGeneralId]: [`${resName} ${amount}을 포상으로 받았습니다.`]
          }
        }
      };
    } catch (e: any) {
      return {
        logs: {
          general: {
            [actorId]: [`포상 실패: ${e.message}`],
          },
        },
      };
    }
  }
}
