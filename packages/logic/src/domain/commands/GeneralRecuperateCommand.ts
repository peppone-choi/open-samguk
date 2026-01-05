import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";

/**
 * 요양 커맨드
 * 레거시: che_요양
 */
export class GeneralRecuperateCommand extends GeneralCommand {
  readonly actionName = "요양";

  constructor() {
    super();
    this.fullConditionConstraints = [];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const generalDelta = general.recuperate();

    return {
      generals: {
        [actorId]: generalDelta,
      },
      logs: {
        general: {
          [actorId]: [`건강 회복을 위해 요양합니다.`],
        },
      },
    };
  }
}
