import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { WarEngine } from "../WarEngine.js";

export class GeneralWarCommand extends GeneralCommand {
  readonly actionName = "출격";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NearCity(),
      ConstraintHelper.ReqGeneralCrew(),
    ];
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
            [actorId]: [`출격 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destCityId } = args;
    const iGeneral = snapshot.generals[actorId];
    const iDestCity = snapshot.cities[destCityId];

    if (iDestCity.nationId === iGeneral.nationId) {
      return {
        logs: {
          general: {
            [actorId]: ["출격 실패: 자국 도시는 공격할 수 없습니다."],
          },
        },
      };
    }

    const warEngine = new WarEngine();
    const result = warEngine.executeBattle(rng, snapshot, actorId, destCityId);

    const delta = result.delta;
    delta.logs = delta.logs || { general: {}, global: [] };
    delta.logs.general = delta.logs.general || {};
    delta.logs.general[actorId] = result.battleLog;

    return delta;
  }
}
