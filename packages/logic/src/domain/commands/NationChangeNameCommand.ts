import { RandUtil, JosaUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 국호변경 커맨드
 * 레거시: che_국호변경 (국가 커맨드이나 장수가 실행)
 */
export class NationChangeNameCommand extends GeneralCommand {
  readonly actionName = '국호변경';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.BeLord(),
      ConstraintHelper.ReqNationMeta('can_국호변경', 0, 'gt', '더이상 변경이 불가능합니다.'),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`국호변경 실패: ${check.reason}`],
          },
        },
      };
    }

    const { nationName } = args;
    if (!nationName || typeof nationName !== 'string' || nationName.trim().length === 0) {
      return {
        logs: {
          general: {
            [actorId]: ['국호변경 실패: 새로운 국호가 지정되지 않았습니다.'],
          },
        },
      };
    }

    const trimmedName = nationName.trim();
    // 한글 기준 바이트 길이를 mb_strwidth 대신 length와 단순 규칙으로 대체 (최대 18자)
    if (trimmedName.length > 18) {
      return {
        logs: {
          general: {
            [actorId]: ['국호변경 실패: 국호가 너무 깁니다. (최대 18자)'],
          },
        },
      };
    }

    // 중복 체크
    const isDuplicate = Object.values(snapshot.nations).some((n) => n.name === trimmedName);
    if (isDuplicate) {
      return {
        logs: {
          general: {
            [actorId]: [`국호변경 실패: 이미 '${trimmedName}' 국호를 가진 국가가 존재합니다.`],
          },
        },
      };
    }

    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return {
        logs: {
          global: [`장수 ${actorId}를 찾을 수 없어 국호변경을 실행할 수 없습니다.`],
        },
      };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: {
            [actorId]: ['국호변경 실패: 소속 국가 정보를 찾을 수 없습니다.'],
          },
        },
      };
    }

    const oldNationName = iNation.name;
    const josaRo = JosaUtil.pick(trimmedName, '로');
    const josaYi = JosaUtil.pick(iActor.name, '이');
    const josaYiNation = JosaUtil.pick(oldNationName, '이');

    return {
      nations: {
        [iNation.id]: {
          name: trimmedName,
          meta: {
            ...iNation.meta,
            can_국호변경: 0,
          },
        },
      },
      generals: {
        [actorId]: {
          experience: iActor.experience + 5,
          dedication: iActor.dedication + 5,
        },
      },
      logs: {
        general: {
          [actorId]: [`국호를 【${trimmedName}】${josaRo} 변경합니다.`],
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 국호를 【${trimmedName}】${josaRo} 변경하였습니다.`],
        },
        global: [
          `${iActor.name}${josaYi} 국호를 【${trimmedName}】${josaRo} 변경하였습니다.`,
          `【국호변경】 ${oldNationName}${josaYiNation} 국호를 【${trimmedName}】${josaRo} 변경합니다.`,
        ],
      },
    };
  }
}