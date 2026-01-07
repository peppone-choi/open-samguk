import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 인구이동 커맨드 - 인접 도시로 인구를 이동
 * 레거시: cr_인구이동
 * Priority: 내정 커맨드
 */
export class NationMigratePopulationCommand extends GeneralCommand {
  readonly actionName = "인구이동";
  static readonly AMOUNT_LIMIT = 100000;

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.ReqCityCapacity(
        "pop",
        "주민",
        GameConst.minAvailableRecruitPop + 100
      ),
    ];
    this.fullConditionConstraints = [
      ConstraintHelper.NotSameDestCity(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.ReqCityCapacity(
        "pop",
        "주민",
        GameConst.minAvailableRecruitPop + 100
      ),
      ConstraintHelper.OccupiedDestCity(),
      ConstraintHelper.NearCity(1),
      ConstraintHelper.BeChief(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.SuppliedDestCity(),
    ];
  }

  getPreReqTurn(): number {
    return 0;
  }

  getPostReqTurn(): number {
    return 0;
  }

  getCost(amount: number, develcost: number): number {
    return Math.round((develcost * amount) / 10000);
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: ["인구이동 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const iSrcCity = snapshot.cities[iActor.cityId];
    if (!iSrcCity) {
      return {
        logs: {
          general: { [actorId]: ["인구이동 실패: 현재 도시 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destCityId, amount } = args;
    if (destCityId === undefined || amount === undefined) {
      return {
        logs: {
          general: { [actorId]: ["인구이동 실패: 대상 도시 또는 이동량이 지정되지 않았습니다."] },
        },
      };
    }

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity) {
      return {
        logs: {
          general: { [actorId]: ["인구이동 실패: 대상 도시를 찾을 수 없습니다."] },
        },
      };
    }

    // 이동량 제한 및 자국 도시 여부는 제약조건에서 이미 걸러졌을 것이나 run에서도 보장
    const maxAmount = Math.min(
      amount,
      NationMigratePopulationCommand.AMOUNT_LIMIT,
      iSrcCity.pop - GameConst.minAvailableRecruitPop
    );

    if (maxAmount <= 0) {
      return {
        logs: {
          general: { [actorId]: ["인구이동 실패: 이동할 수 있는 인구가 부족합니다."] },
        },
      };
    }

    const develcost = snapshot.env?.develcost ?? 100;
    const reqAmount = this.getCost(maxAmount, develcost);

    if (iNation.gold < GameConst.minNationalGold + reqAmount || iNation.rice < GameConst.minNationalRice + reqAmount) {
      return {
        logs: {
          general: { [actorId]: ["인구이동 실패: 국고 자금 또는 군량이 부족합니다."] },
        },
      };
    }

    const josaRo = JosaUtil.pick(iDestCity.name, "로");
    const expGain = 5;

    return {
      generals: {
        [actorId]: {
          experience: iActor.experience + expGain,
          dedication: iActor.dedication + expGain,
          lastTurn: {
            action: this.actionName,
            destCityId,
            amount: maxAmount,
          },
        },
      },
      cities: {
        [iSrcCity.id]: {
          pop: iSrcCity.pop - maxAmount,
        },
        [destCityId]: {
          pop: iDestCity.pop + maxAmount,
        },
      },
      nations: {
        [iNation.id]: {
          gold: iNation.gold - reqAmount,
          rice: iNation.rice - reqAmount,
        },
      },
      logs: {
        general: {
          [actorId]: [
            `【${iDestCity.name}】${josaRo} 인구 ${maxAmount.toLocaleString()}명을 옮겼습니다.`,
          ],
        },
      },
    };
  }
}
