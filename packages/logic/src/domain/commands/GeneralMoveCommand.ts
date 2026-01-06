import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { MapUtil } from "../MapData.js";

/**
 * 이동 커맨드
 * 레거시: che_이동
 */
export class GeneralMoveCommand extends GeneralCommand {
  readonly actionName = "이동";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.ReqGeneralGold(100), // 임시 비용
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NearCity(1),
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
            [actorId]: [`이동 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const destCityId = args.destCityId;
    const destCityName =
      MapUtil.getCity(destCityId)?.name ?? `도시 ${destCityId}`;

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const generalDelta = general.move(destCityId);

    return {
      generals: {
        [actorId]: generalDelta,
      },
      logs: {
        general: {
          [actorId]: [`${destCityName}(으)로 이동했습니다.`],
        },
      },
    };
  }
}
