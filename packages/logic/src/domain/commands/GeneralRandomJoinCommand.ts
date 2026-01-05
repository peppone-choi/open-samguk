import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';
import { GameConst } from '../GameConst.js';

/**
 * 랜덤임관 커맨드 - 무작위 국가에 임관
 * 레거시: che_랜덤임관
 */
export class GeneralRandomJoinCommand extends GeneralCommand {
  readonly actionName = '무작위 국가로 임관';

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.BeNeutral(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`랜덤임관 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];

    // 임관 가능한 국가 목록 (정원 미달, 스카웃 가능)
    const availableNations = Object.values(snapshot.nations).filter(n => {
      if (n.level <= 0) return false; // 멸망한 국가 제외
      const nationGenerals = Object.values(snapshot.generals).filter(g => g.nationId === n.id);
      return nationGenerals.length < GameConst.defaultMaxGeneral;
    });

    if (availableNations.length === 0) {
      return {
        logs: {
          general: { [actorId]: ['임관 가능한 국가가 없습니다.'] },
        },
      };
    }

    // 가중치 기반 무작위 선택 (간소화)
    const destNation = rng.choice(availableNations);

    // 군주 도시로 이동
    const lordGeneral = Object.values(snapshot.generals).find(
      g => g.nationId === destNation.id && g.officerLevel === 12
    );
    const destCityId = lordGeneral?.cityId || destNation.capitalId;

    const randomTalkList = [
      '어쩌다 보니',
      '인연이 닿아',
      '발길이 닿는 대로',
      '소문을 듣고',
      '점괘에 따라',
      '천거를 받아',
      '뜻을 펼칠 곳을 찾아',
    ];
    const randomTalk = rng.choice(randomTalkList);

    const exp = 100;

    return {
      generals: {
        [actorId]: {
          nationId: destNation.id,
          cityId: destCityId,
          officerLevel: 1,
          experience: iGeneral.experience + exp,
        },
      },
      logs: {
        general: {
          [actorId]: [`${destNation.name}에 랜덤 임관했습니다.`],
        },
        global: [`${iGeneral.name}이(가) ${randomTalk} ${destNation.name}에 임관했습니다.`],
      },
    };
  }
}
