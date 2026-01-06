import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";

/**
 * NPC 능동 커맨드
 * 레거시: che_NPC능동
 */
export class GeneralNPCActiveCommand extends GeneralCommand {
  readonly actionName = "NPC능동";

  constructor() {
    super();
    this.minConditionConstraints = [];
  }

  run(
    _rng: RandUtil,
    _snapshot: WorldSnapshot,
    actorId: number,
    _args: Record<string, unknown>,
  ): WorldDelta {
    // TODO: NPC 능동 로직 구현
    return {
      generals: {
        [actorId]: {},
      },
    };
  }
}
