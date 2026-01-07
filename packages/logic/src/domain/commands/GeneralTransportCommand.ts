import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 수송 커맨드
 * 레거시: che_수송
 */
export class GeneralTransportCommand extends GeneralCommand {
  readonly actionName = "수송";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`수송 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destCityId, goldAmount, riceAmount } = args;
    if (destCityId === undefined || (goldAmount <= 0 && riceAmount <= 0)) {
      return {
        logs: {
          general: {
            [actorId]: ["수송 실패: 대상 도시 또는 수송량이 올바르지 않습니다."],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iDestCity = snapshot.cities[destCityId];

    if (!iDestCity) {
      return {
        logs: {
          general: { [actorId]: ["수송 실패: 대상 도시를 찾을 수 없습니다."] },
        },
      };
    }

    if (iDestCity.nationId !== iGeneral.nationId) {
      return {
        logs: {
          general: {
            [actorId]: ["수송 실패: 자국 도시로만 수송할 수 있습니다."],
          },
        },
      };
    }

    if (iGeneral.gold < goldAmount || iGeneral.rice < riceAmount) {
      return {
        logs: {
          general: { [actorId]: ["수송 실패: 자원이 부족합니다."] },
        },
      };
    }

    const nation = snapshot.nations[iGeneral.nationId];
    if (!nation) {
      return {
        logs: {
          general: { [actorId]: ["수송 실패: 소속 국가가 없습니다."] },
        },
      };
    }

    return {
      generals: {
        [actorId]: {
          gold: iGeneral.gold - goldAmount,
          rice: iGeneral.rice - riceAmount,
          experience: iGeneral.experience + 100,
          politicsExp: iGeneral.politicsExp + 1,
        },
      },
      nations: {
        [nation.id]: {
          gold: nation.gold + goldAmount,
          rice: nation.rice + riceAmount,
        },
      },
      logs: {
        general: {
          [actorId]: [`국고에 금 ${goldAmount}, 쌀 ${riceAmount}을 수송했습니다.`],
        },
      },
    };
  }
}
