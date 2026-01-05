import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { General } from '../models/General.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 등용 커맨드
 * 레거시: che_등용
 */
export class GeneralRecruitCommand extends GeneralCommand {
  readonly actionName = '등용';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestGeneral(),
      ConstraintHelper.DifferentNationDestGeneral(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`등용 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iDestGeneral = snapshot.generals[args.destGeneralId];
    if (!iGeneral || !iDestGeneral) throw new Error('장수를 찾을 수 없습니다.');

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const { delta: generalDelta, reqGold } = general.recruit(iDestGeneral.experience, iDestGeneral.dedication);

    // 자금 부족 체크 (recruit 내부에서 gold를 0으로 만들지만, 실제로는 실행 전에 체크해야 함)
    // 여기서는 이미 fullConditionConstraints에서 ReqGeneralGold를 체크하도록 추가할 수 있음.
    // 하지만 비용이 가변적이므로 run 내부에서 체크하거나 가변 비용 제약을 만들어야 함.
    if (iGeneral.gold < reqGold) {
        return {
            logs: {
                general: {
                    [actorId]: [`등용 실패: 자금이 부족합니다. (필요: ${reqGold})`],
                },
            },
        };
    }

    return {
      generals: {
        [actorId]: generalDelta,
      },
      messages: [
        {
          id: 0, // 임시 ID, 저장 시 할당됨
          mailbox: 'private',
          srcId: actorId,
          destId: iDestGeneral.id,
          text: `${iGeneral.name} 장수가 당신에게 등용 권유 서신을 보냈습니다.`,
          sentAt: new Date(), // TODO: snapshot의 현재 시간을 사용해야 할 수도 있음
          meta: { type: 'recruit', nationId: iGeneral.nationId },
        }
      ],
      logs: {
        general: {
          [actorId]: [`${iDestGeneral.name}에게 등용 권유 서신을 보냈습니다. (소모 자금: ${reqGold})`],
        },
      },
    };
  }
}
