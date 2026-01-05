import { RandUtil, JosaUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 증축 커맨드 (수도 확장)
 * 레거시: che_증축
 */
export class NationExpandCapitalCommand extends GeneralCommand {
  readonly actionName = '증축';

  // GameConst 값들 (추후 설정에서 가져와야 함)
  private readonly EXPAND_CITY_COST_COEF = 5;
  private readonly EXPAND_CITY_DEFAULT_COST = 1000;
  private readonly EXPAND_CITY_POP_INCREASE = 1000;
  private readonly EXPAND_CITY_DEVEL_INCREASE = 100;
  private readonly EXPAND_CITY_WALL_INCREASE = 500;

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeLord(),
      ConstraintHelper.SuppliedCity(),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  private getCost(snapshot: WorldSnapshot): number {
    const develcost = snapshot.env.develcost ?? 100;
    return develcost * this.EXPAND_CITY_COST_COEF + this.EXPAND_CITY_DEFAULT_COST;
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) return { logs: { general: { [actorId]: ['증축 실패: 소속 국가 정보를 찾을 수 없습니다.'] } } };

    if (!iNation.capitalCityId || iNation.capitalCityId === 0) {
      return { logs: { general: { [actorId]: ['증축 실패: 방랑 상태에서는 불가능합니다.'] } } };
    }

    const iCapital = snapshot.cities[iNation.capitalCityId];
    if (!iCapital) {
      return { logs: { general: { [actorId]: ['증축 실패: 수도 정보를 찾을 수 없습니다.'] } } };
    }

    // 레벨 제한 확인 (4 이상 8 미만)
    if (iCapital.level <= 3) {
      return { logs: { general: { [actorId]: ['증축 실패: 수진, 진, 관문에서는 불가능합니다.'] } } };
    }

    if (iCapital.level >= 8) {
      return { logs: { general: { [actorId]: ['증축 실패: 더이상 증축할 수 없습니다.'] } } };
    }

    const cost = this.getCost(snapshot);
    const basegold = snapshot.env.basegold ?? 1000;
    const baserice = snapshot.env.baserice ?? 1000;

    if (iNation.gold < basegold + cost || iNation.rice < baserice + cost) {
      return { logs: { general: { [actorId]: [`증축 실패: 자원이 부족합니다. (필요: 금 ${cost}, 쌀 ${cost})`] } } };
    }

    // 준비 턴 확인 (5턴 필요)
    const preReqTurn = 5;
    const lastTurn = iActor.lastTurn || {};
    const currentTerm = (lastTurn.action === this.actionName) ? (lastTurn.term || 0) : 0;
    const capset = (iNation.meta?.capset || 0);
    const lastSeq = lastTurn.seq || 0;

    // capset이 변경되었으면 리셋
    if (lastSeq < capset) {
      return {
        generals: {
          [actorId]: {
            lastTurn: {
              action: this.actionName,
              term: 1,
              seq: capset,
            }
          }
        },
        logs: {
          general: {
            [actorId]: [`수도를 증축 준비 중입니다... (1/${preReqTurn + 1})`],
          }
        }
      };
    }

    // 준비 턴이 남은 경우
    if (currentTerm < preReqTurn) {
      return {
        generals: {
          [actorId]: {
            lastTurn: {
              action: this.actionName,
              term: currentTerm + 1,
              seq: capset,
            }
          }
        },
        logs: {
          general: {
            [actorId]: [`수도를 증축 준비 중입니다... (${currentTerm + 1}/${preReqTurn + 1})`],
          }
        }
      };
    }

    // 실제 증축 실행
    const josaUl = JosaUtil.pick(iCapital.name, '을');
    const josaYi = JosaUtil.pick(iActor.name, '이');
    const josaYiNation = JosaUtil.pick(iNation.name, '이');

    return {
      cities: {
        [iCapital.id]: {
          level: iCapital.level + 1,
          popMax: iCapital.popMax + this.EXPAND_CITY_POP_INCREASE,
          agriMax: iCapital.agriMax + this.EXPAND_CITY_DEVEL_INCREASE,
          commMax: iCapital.commMax + this.EXPAND_CITY_DEVEL_INCREASE,
          secuMax: iCapital.secuMax + this.EXPAND_CITY_DEVEL_INCREASE,
          defMax: iCapital.defMax + this.EXPAND_CITY_WALL_INCREASE,
          wallMax: iCapital.wallMax + this.EXPAND_CITY_WALL_INCREASE,
        }
      },
      nations: {
        [iNation.id]: {
          gold: iNation.gold - cost,
          rice: iNation.rice - cost,
          meta: {
            ...iNation.meta,
            capset: capset + 1,
          }
        }
      },
      generals: {
        [actorId]: {
          experience: iActor.experience + 5 * (preReqTurn + 1),
          dedication: iActor.dedication + 5 * (preReqTurn + 1),
          lastTurn: {
            action: this.actionName,
            term: 0,
            seq: capset + 1,
          }
        }
      },
      logs: {
        general: {
          [actorId]: [`【${iCapital.name}】${josaUl} 증축했습니다.`],
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 【${iCapital.name}】${josaUl} 증축`],
        },
        global: [
          `${iActor.name}${josaYi} 【${iCapital.name}】${josaUl} 증축하였습니다.`,
          `【증축】 ${iNation.name}${josaYiNation} 【${iCapital.name}】${josaUl} 증축하였습니다.`,
        ],
      },
    };
  }
}
