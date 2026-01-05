import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta, Delta, City as ICity, General as IGeneral } from '../entities.js';
import { General } from '../models/General.js';
import { GameConst } from '../GameConst.js';
import { ConstraintHelper } from '../ConstraintHelper.js';
import { MapUtil } from '../MapData.js';

export abstract class GeneralSabotageCommand extends GeneralCommand {
  abstract readonly statType: 'leadership' | 'strength' | 'intel';
  readonly actionName: string = '계략';

  constructor() {
    super();
    // 상속받는 클래스에서 actionName을 오버라이드 하거나 생성자에서 설정해야 함
  }

  protected getSabotageCost(snapshot: WorldSnapshot): number {
    const develcost = snapshot.env['develcost'] || 20;
    return develcost * 5;
  }

  protected calcAttackProb(rng: RandUtil, snapshot: WorldSnapshot, actorId: number): number {
    const general = snapshot.generals[actorId];
    if (!general) return 0;

    let score = 0;
    if (this.statType === 'leadership') score = general.leadership;
    else if (this.statType === 'strength') score = general.strength;
    else if (this.statType === 'intel') score = general.intel;

    return score / GameConst.sabotageProbCoefByStat;
  }

  protected calcDefenceProb(rng: RandUtil, snapshot: WorldSnapshot, destCityId: number, destNationId: number): number {
    const destCity = snapshot.cities[destCityId];
    if (!destCity) return 0;

    const cityGenerals = Object.values(snapshot.generals).filter(g => g.cityId === destCityId && g.nationId === destNationId);
    
    let maxGenScore = 0;
    for (const g of cityGenerals) {
      let score = 0;
      if (this.statType === 'leadership') score = g.leadership;
      else if (this.statType === 'strength') score = g.strength;
      else if (this.statType === 'intel') score = g.intel;
      maxGenScore = Math.max(maxGenScore, score);
    }

    let prob = maxGenScore / GameConst.sabotageProbCoefByStat;
    prob += (Math.log2(cityGenerals.length + 1) - 1.25) * GameConst.sabotageDefenceCoefByGeneralCnt;
    prob += (destCity.secu / destCity.secuMax) / 5;
    prob += destCity.supply ? 0.1 : 0;

    return prob;
  }

  abstract affectDestCity(rng: RandUtil, destCity: ICity): { cityDelta: Delta<ICity>, successMsg: string };

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const cost = this.getSabotageCost(snapshot);
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.ReqGeneralGold(cost),
      ConstraintHelper.ReqGeneralRice(cost),
    ];

    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return { logs: { general: { [actorId]: [`실행 불가: ${check.reason}`] } } };
    }

    const iGeneral = snapshot.generals[actorId];
    const destCityId = args.destCityId;
    const destCity = snapshot.cities[destCityId];
    if (!iGeneral || !destCity) throw new Error('데이터 오류');

    // 거리 계산 (임시: 인접 도시만 가능하도록 하거나 거리에 따른 확률 감소)
    const actorCityId = iGeneral.cityId;
    const dist = 1; // TODO: MapUtil에서 실제 거리 계산 필요

    const prob = (GameConst.sabotageDefaultProb + this.calcAttackProb(rng, snapshot, actorId) - this.calcDefenceProb(rng, snapshot, destCityId, destCity.nationId)) / dist;
    const finalProb = Math.min(Math.max(prob, 0), 0.5);

    const general = new General(iGeneral);
    const costDelta = {
      gold: iGeneral.gold - cost,
      rice: iGeneral.rice - cost,
    };

    if (!rng.nextBool(finalProb)) {
      // 실패
      const expGain = rng.nextRangeInt(1, 100);
      const dedGain = rng.nextRangeInt(1, 70);
      
      return {
        generals: {
          [actorId]: {
            ...costDelta,
            experience: iGeneral.experience + expGain,
            dedication: iGeneral.dedication + dedGain,
            ...general.updateLastTurn(this.actionName, args),
          }
        },
        logs: {
          general: {
            [actorId]: [`${destCity.name}에 대한 ${this.actionName}에 실패했습니다.`],
          }
        }
      };
    }

    // 성공
    const { cityDelta, successMsg } = this.affectDestCity(rng, destCity);
    const expGain = rng.nextRangeInt(201, 300);
    const dedGain = rng.nextRangeInt(141, 210);

    return {
      generals: {
        [actorId]: {
          ...costDelta,
          experience: iGeneral.experience + expGain,
          dedication: iGeneral.dedication + dedGain,
          ...general.updateLastTurn(this.actionName, args),
        }
      },
      cities: {
        [destCityId]: cityDelta,
      },
      logs: {
        global: [`누군가가 ${destCity.name}에 ${this.actionName}(을)를 실행했습니다.`],
        general: {
          [actorId]: [`${destCity.name}에 대한 ${this.actionName}에 성공했습니다.`, successMsg],
        }
      }
    };
  }
}
