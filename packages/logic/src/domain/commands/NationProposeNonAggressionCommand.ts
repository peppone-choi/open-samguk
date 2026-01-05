import { RandUtil, JosaUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta, Message } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 불가침 제의 커맨드
 * 레거시: che_불가침제의
 */
export class NationProposeNonAggressionCommand extends GeneralCommand {
  readonly actionName = '불가침 제의';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.BeLord(),
      ConstraintHelper.NotBeNeutral(),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) return { logs: { general: { [actorId]: ['불가침 제의 실패: 소속 국가 정보를 찾을 수 없습니다.'] } } };

    const { destNationId, year, month } = args;
    if (destNationId === undefined || year === undefined || month === undefined) {
      return { logs: { general: { [actorId]: ['불가침 제의 실패: 대상 국가 또는 기한이 지정되지 않았습니다.'] } } };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return { logs: { general: { [actorId]: ['불가침 제의 실패: 대상 국가를 찾을 수 없습니다.'] } } };
    }

    if (iDestNation.id === iNation.id) {
      return { logs: { general: { [actorId]: ['불가침 제의 실패: 자국에게는 불가침을 제의할 수 없습니다.'] } } };
    }

    // 기한 검증 (최소 6개월)
    const currentMonth = snapshot.gameTime.year * 12 + snapshot.gameTime.month - 1;
    const reqMonth = year * 12 + month - 1;

    if (reqMonth < currentMonth + 6) {
      return { logs: { general: { [actorId]: ['불가침 제의 실패: 기한은 6개월 이상이어야 합니다.'] } } };
    }

    // 외교 관계 확인
    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (iDiplomacy) {
      if (iDiplomacy.state === '0') {
        return { logs: { general: { [actorId]: ['불가침 제의 실패: 아국과 이미 교전중입니다.'] } } };
      }
      if (iDiplomacy.state === '1') {
        return { logs: { general: { [actorId]: ['불가침 제의 실패: 아국과 이미 선포중입니다.'] } } };
      }
    }

    const josaRo = JosaUtil.pick(iNation.name, '로');
    const josaWa = JosaUtil.pick(iNation.name, '와');

    // 외교 메시지 생성
    const message: Message = {
      id: Date.now(), // 임시 ID
      mailbox: `nation:${destNationId}`,
      srcId: actorId,
      destId: null, // 국가 메시지
      text: `${iNation.name}${josaWa} ${year}년 ${month}월까지 불가침 제의 서신`,
      sentAt: new Date(),
      meta: {
        type: 'diplomacy',
        action: 'propose_non_aggression',
        srcNationId: iNation.id,
        destNationId: destNationId,
        year,
        month,
        srcGeneralId: actorId,
      },
    };

    return {
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
            destNationId,
            year,
            month,
          }
        }
      },
      messages: [message],
      logs: {
        general: {
          [actorId]: [`【${iDestNation.name}】${josaRo} 불가침 제의 서신을 보냈습니다.`],
        },
      },
    };
  }
}
