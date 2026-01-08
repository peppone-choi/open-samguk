import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 허보 커맨드 - 적국 도시의 장수들을 랜덤 이동시킴
 * 레거시: che_허보
 * Priority: 전략 커맨드
 */
export class NationFalseReportCommand extends GeneralCommand {
  readonly actionName = "허보";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.AvailableStrategicCommand(1), // preReqTurn = 1
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestNation(), // destCityId의 소속 국가 존재 여부
      ConstraintHelper.AllowDiplomacyStatus(["0", "1"], "선포, 전쟁중인 상대국에게만 가능합니다."),
    ];
  }

  getPreReqTurn(): number {
    return 1;
  }

  getPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    // sqrt(genCount * 4) * 10
    return Math.round(Math.sqrt(genCount * 4) * 10);
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
          general: { [actorId]: ["허보 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destCityId } = args;
    if (destCityId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["허보 실패: 대상 도시가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity) {
      return {
        logs: {
          general: { [actorId]: ["허보 실패: 대상 도시를 찾을 수 없습니다."] },
        },
      };
    }

    if (iDestCity.nationId === 0) {
      return {
        logs: {
          general: { [actorId]: ["허보 실패: 공백지에는 허보를 발동할 수 없습니다."] },
        },
      };
    }

    if (iDestCity.nationId === iNation.id) {
      return {
        logs: {
          general: { [actorId]: ["허보 실패: 자국 도시에는 허보를 발동할 수 없습니다."] },
        },
      };
    }

    const iDestNation = snapshot.nations[iDestCity.nationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["허보 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const nationGeneralCount = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iNation.id
    ).length;
    const postReqTurn = this.getPostReqTurn(nationGeneralCount);

    const destNationCities = Object.values(snapshot.cities)
      .filter((c) => c.nationId === iDestCity.nationId)
      .map((c) => c.id);

    const targetGenerals = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iDestCity.nationId && g.cityId === destCityId
    );

    const generalUpdates: Record<number, any> = {
      [actorId]: {
        experience: iActor.experience + expGain,
        dedication: iActor.dedication + expGain,
        lastTurn: {
          action: this.actionName,
          destCityId,
        },
      },
    };

    for (const g of targetGenerals) {
      let newCityId = rng.choice(destNationCities);
      if (newCityId === destCityId && destNationCities.length > 1) {
        // 한 번 더 선택 시도 (완전 무작위)
        newCityId = rng.choice(destNationCities);
      }
      generalUpdates[g.id] = {
        cityId: newCityId,
      };
    }

    return {
      generals: generalUpdates,
      nations: {
        [iNation.id]: {
          strategicCmdLimit: 9,
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestCity.name}】에 허보를 발동했습니다.`],
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 【${iDestCity.name}】에 허보를 발동`],
          [iDestNation.id]: [
            `【${iNation.name}】의 ${iActor.name}${josaYi} 아국의 【${iDestCity.name}】에 허보를 발동`,
          ],
        },
        global: [`${iActor.name}${josaYi} 【${iDestCity.name}】에 허보를 발동하였습니다.`],
      },
    };
  }
}
