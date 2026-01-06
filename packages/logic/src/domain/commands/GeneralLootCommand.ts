import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import {
  WorldSnapshot,
  WorldDelta,
  Delta,
  City as ICity,
  Nation as INation,
} from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";
import { MapUtil } from "../MapData.js";

/**
 * 탈취 커맨드 - 적 도시에서 자원을 약탈
 * 레거시: che_탈취 (che_화계 상속)
 *
 * 스탯: 무력 기반 (화계는 지력)
 * 비용: develcost * 5 (금 + 군량)
 * 효과: 성공 시 적국 국고에서 자원 탈취 (70% 국고, 30% 장수)
 */
export class GeneralLootCommand extends GeneralCommand {
  readonly actionName = "탈취";
  readonly statType = "strength";

  constructor() {
    super();
    // 기본 제약은 run에서 비용에 따라 동적으로 설정
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
    ];
  }

  private getSabotageCost(snapshot: WorldSnapshot): number {
    const develcost = (snapshot.env["develcost"] as number) ?? 20;
    return develcost * 5;
  }

  private calcAttackProb(snapshot: WorldSnapshot, actorId: number): number {
    const general = snapshot.generals[actorId];
    if (!general) return 0;
    // 탈취는 무력 기반
    const score = general.strength;
    return score / GameConst.sabotageProbCoefByStat;
  }

  private calcDefenceProb(
    snapshot: WorldSnapshot,
    destCityId: number,
    destNationId: number,
  ): number {
    const destCity = snapshot.cities[destCityId];
    if (!destCity) return 0;

    const cityGenerals = Object.values(snapshot.generals).filter(
      (g) => g.cityId === destCityId && g.nationId === destNationId,
    );

    let maxGenScore = 0;
    for (const g of cityGenerals) {
      // 방어도 무력 기반
      maxGenScore = Math.max(maxGenScore, g.strength);
    }

    let prob = maxGenScore / GameConst.sabotageProbCoefByStat;
    prob +=
      (Math.log2(cityGenerals.length + 1) - 1.25) *
      GameConst.sabotageDefenceCoefByGeneralCnt;
    prob += destCity.secu / destCity.secuMax / 5;
    prob += destCity.supply ? 0.1 : 0;

    return prob;
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, unknown>,
  ): WorldDelta {
    const cost = this.getSabotageCost(snapshot);

    // 동적 제약 설정
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.ReqGeneralGold(cost),
      ConstraintHelper.ReqGeneralRice(cost),
    ];

    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: { [actorId]: [`탈취 실패: ${check.reason}`] },
        },
      };
    }

    const destCityId = args.destCityId as number;
    if (!destCityId) {
      return {
        logs: {
          general: {
            [actorId]: ["탈취 실패: 대상 도시가 지정되지 않았습니다."],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const destCity = snapshot.cities[destCityId];

    if (!iGeneral || !destCity) {
      return {
        logs: {
          general: { [actorId]: ["탈취 실패: 정보를 찾을 수 없습니다."] },
        },
      };
    }

    // 아국 도시 체크
    if (destCity.nationId === iGeneral.nationId) {
      return {
        logs: {
          general: { [actorId]: ["탈취 실패: 아국 도시입니다."] },
        },
      };
    }

    // 공백지 체크
    if (destCity.nationId === 0) {
      return {
        logs: {
          general: { [actorId]: ["탈취 실패: 공백지입니다."] },
        },
      };
    }

    const destNation = snapshot.nations[destCity.nationId];
    if (!destNation) {
      return {
        logs: {
          general: {
            [actorId]: ["탈취 실패: 대상 국가 정보를 찾을 수 없습니다."],
          },
        },
      };
    }

    // 거리 계산
    const dist = MapUtil.getDistance(iGeneral.cityId, destCityId);
    if (dist > 5) {
      return {
        logs: {
          general: { [actorId]: ["탈취 실패: 너무 먼 도시입니다."] },
        },
      };
    }

    // 확률 계산
    const attackProb = this.calcAttackProb(snapshot, actorId);
    const defenceProb = this.calcDefenceProb(
      snapshot,
      destCityId,
      destCity.nationId,
    );
    let prob = GameConst.sabotageDefaultProb + attackProb - defenceProb;
    prob = prob / dist;
    prob = Math.max(0, Math.min(0.5, prob));

    // 비용 차감 (공통)
    const generalDelta: Delta<typeof iGeneral> = {
      gold: iGeneral.gold - cost,
      rice: iGeneral.rice - cost,
    };

    // 실패 시
    if (!rng.nextBool(prob)) {
      const exp = rng.nextRangeInt(1, 100);
      const ded = rng.nextRangeInt(1, 70);

      return {
        generals: {
          [actorId]: {
            ...generalDelta,
            experience: iGeneral.experience + exp,
            dedication: iGeneral.dedication + ded,
            strengthExp: iGeneral.strengthExp + 1,
          },
        },
        logs: {
          general: {
            [actorId]: [`${destCity.name}에 탈취가 실패했습니다.`],
          },
        },
      };
    }

    // 성공 시 - 탈취량 계산
    const startYear = (snapshot.env["startyear"] as number) ?? 184;
    const currentYear = snapshot.gameTime.year;
    const yearCoef = Math.sqrt(1 + (currentYear - startYear) / 4) / 2;

    const commRatio = destCity.comm / destCity.commMax;
    const agriRatio = destCity.agri / destCity.agriMax;

    let goldStolen = Math.round(
      rng.nextRangeInt(
        GameConst.sabotageDamageMin,
        GameConst.sabotageDamageMax,
      ) *
        destCity.level *
        yearCoef *
        (0.25 + commRatio / 4),
    );
    let riceStolen = Math.round(
      rng.nextRangeInt(
        GameConst.sabotageDamageMin,
        GameConst.sabotageDamageMax,
      ) *
        destCity.level *
        yearCoef *
        (0.25 + agriRatio / 4),
    );

    const nationDelta: Delta<INation> = {};
    const cityDelta: Delta<ICity> = { state: 32 };
    const actorNationId = iGeneral.nationId;
    const actorNationDelta: Delta<INation> = {};

    // 보급 연결된 도시인 경우 국고에서 차감
    if (destCity.supply === 1) {
      let destNationGold = destNation.gold - goldStolen;
      let destNationRice = destNation.rice - riceStolen;

      // 최소치 보정
      if (destNationGold < GameConst.minNationalGold) {
        goldStolen += destNationGold - GameConst.minNationalGold;
        destNationGold = GameConst.minNationalGold;
      }
      if (destNationRice < GameConst.minNationalRice) {
        riceStolen += destNationRice - GameConst.minNationalRice;
        destNationRice = GameConst.minNationalRice;
      }

      nationDelta.gold = destNationGold;
      nationDelta.rice = destNationRice;
    } else {
      // 보급 안되는 도시는 도시 자체 피해
      cityDelta.comm = Math.max(0, destCity.comm - Math.floor(goldStolen / 12));
      cityDelta.agri = Math.max(0, destCity.agri - Math.floor(riceStolen / 12));
    }

    // 70% 국고, 30% 장수 (재야면 100% 장수)
    let generalGoldGain: number;
    let generalRiceGain: number;

    if (actorNationId !== 0) {
      const nationShare = 0.7;
      generalGoldGain = Math.round(goldStolen * (1 - nationShare));
      generalRiceGain = Math.round(riceStolen * (1 - nationShare));

      const actorNation = snapshot.nations[actorNationId];
      if (actorNation) {
        actorNationDelta.gold =
          actorNation.gold + Math.round(goldStolen * nationShare);
        actorNationDelta.rice =
          actorNation.rice + Math.round(riceStolen * nationShare);
      }
    } else {
      generalGoldGain = goldStolen;
      generalRiceGain = riceStolen;
    }

    const exp = rng.nextRangeInt(201, 300);
    const ded = rng.nextRangeInt(141, 210);

    const josaYi = JosaUtil.pick(destCity.name, "이");

    const result: WorldDelta = {
      generals: {
        [actorId]: {
          ...generalDelta,
          gold: generalDelta.gold! + generalGoldGain,
          rice: generalDelta.rice! + generalRiceGain,
          experience: iGeneral.experience + exp,
          dedication: iGeneral.dedication + ded,
          strengthExp: iGeneral.strengthExp + 1,
        },
      },
      cities: {
        [destCityId]: cityDelta,
      },
      logs: {
        general: {
          [actorId]: [
            `${destCity.name}에 탈취가 성공했습니다.`,
            `금 ${goldStolen.toLocaleString()}, 쌀 ${riceStolen.toLocaleString()}을 획득했습니다.`,
          ],
        },
        global: [`${destCity.name}${josaYi} 약탈당했습니다.`],
      },
    };

    // 적국 국고 변화 (보급 도시인 경우)
    if (Object.keys(nationDelta).length > 0) {
      result.nations = {
        [destCity.nationId]: nationDelta,
      };
    }

    // 아국 국고 변화 (재야가 아닌 경우)
    if (Object.keys(actorNationDelta).length > 0) {
      result.nations = {
        ...result.nations,
        [actorNationId]: actorNationDelta,
      };
    }

    return result;
  }
}
