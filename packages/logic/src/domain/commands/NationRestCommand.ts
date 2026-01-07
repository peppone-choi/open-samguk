import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";

/**
 * 휴식 커맨드
 * 레거시: 휴식 (국가 커맨드)
 */
export class NationRestCommand extends GeneralCommand {
  readonly actionName = "휴식";

  constructor() {
    super();
    // 휴식은 항상 가능
    this.minConditionConstraints = [];
    this.fullConditionConstraints = [];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    // 휴식은 아무것도 하지 않음
    return {
      generals: {
        [actorId]: {
          lastTurn: {
            action: this.actionName,
          },
        },
      },
      logs: {
        general: {
          [actorId]: ["휴식했습니다."],
        },
      },
    };
  }
}
