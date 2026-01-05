import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';
import { GameConst } from '../GameConst.js';

/**
 * 해산 커맨드 - 방랑 국가를 해산
 * 레거시: che_해산
 */
export class GeneralDisbandCommand extends GeneralCommand {
  readonly actionName = '해산';

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.BeLord(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`해산 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iNation = snapshot.nations[iGeneral.nationId];

    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: ['해산 실패: 국가가 없습니다.'] },
        },
      };
    }

    // 방랑 국가 체크 (레벨 0)
    if (iNation.level !== 0) {
      return {
        logs: {
          general: { [actorId]: ['해산 실패: 방랑 세력만 해산할 수 있습니다.'] },
        },
      };
    }

    // 국가 소속 장수들을 모두 재야로
    const nationGenerals = Object.values(snapshot.generals).filter(
      g => g.nationId === iGeneral.nationId
    );

    const generalUpdates: Record<number, Partial<any>> = {};
    for (const g of nationGenerals) {
      generalUpdates[g.id] = {
        nationId: 0,
        officerLevel: 0,
        gold: Math.min(g.gold, GameConst.defaultGold),
        rice: Math.min(g.rice, GameConst.defaultRice),
      };
    }

    return {
      generals: generalUpdates,
      nations: {
        [iGeneral.nationId]: {
          level: -1, // 멸망 표시
        },
      },
      logs: {
        general: {
          [actorId]: ['세력을 해산했습니다.'],
        },
        global: [`${iGeneral.name}이(가) 세력을 해산했습니다.`],
      },
    };
  }
}
