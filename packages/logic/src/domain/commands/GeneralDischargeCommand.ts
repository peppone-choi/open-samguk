import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 소집해제 커맨드
 * 레거시: che_소집해제
 */
export class GeneralDischargeCommand extends GeneralCommand {
  readonly actionName = "소집해제";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.NotBeNeutral()];
    this.fullConditionConstraints = [...this.minConditionConstraints];
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
            [actorId]: [`소집해제 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (iGeneral.crew === 0) {
      return {
        logs: {
          general: { [actorId]: ["해제할 병사가 없습니다."] },
        },
      };
    }

    return {
      generals: {
        [actorId]: {
          crew: 0,
          train: 0,
          atmos: 0,
        },
      },
      logs: {
        general: {
          [actorId]: ["병사를 모두 소집해제했습니다."],
        },
      },
    };
  }
}
