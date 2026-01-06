import { RandUtil } from "@sammo-ts/common";
import { GameConst } from "../GameConst.js";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { City } from "../models/City.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 모병 커맨드
 * 레거시: che_모병
 */
export class GeneralDraftCommand extends GeneralCommand {
  readonly actionName = "모병";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ReqGeneralGold(GameConst.draftGoldCost),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`모병 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iCity = snapshot.cities[iGeneral.cityId];

    const general = new General(iGeneral);
    const city = new City(iCity);

    const { delta: generalDelta, crewGain } = general.draft(
      iGeneral.leadership,
    );

    // 도시 인구 및 치안 감소
    const popLoss = Math.round(crewGain * 1.2);
    const cityDeltaPop = city.decreasePop(popLoss);
    const cityDeltaSecu = city.decreaseSecu(GameConst.draftSecuLoss);

    return {
      generals: {
        [actorId]: generalDelta,
      },
      cities: {
        [iGeneral.cityId]: {
          ...cityDeltaPop,
          ...cityDeltaSecu,
        },
      },
      logs: {
        general: {
          [actorId]: [
            `병사 ${crewGain}명을 모병했습니다. (인구 -${popLoss}, 치안 -${GameConst.draftSecuLoss})`,
          ],
        },
      },
    };
  }
}
