import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { MapUtil } from "../MapData.js";

/**
 * 이동 커맨드 (레거시: che_이동)
 * 장수를 인접한 도시로 이동시킵니다.
 */
export class GeneralMoveCommand extends GeneralCommand {
  readonly actionName = "이동";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.ReqGeneralGold(100), // 임시 이동 비용
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NearCity(1), // 인접한 도시여야 함
    ];
  }

  /**
   * 이동 명령을 실행합니다.
   *
   * @param rng 난수 생성기
   * @param snapshot 월드 스냅샷
   * @param actorId 장수 ID
   * @param args { destCityId: 목적지 도시 ID }
   * @returns 상태 변경 델타
   */
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
            [actorId]: [`이동 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const destCityId = args.destCityId;
    const destCityName = MapUtil.getCity(destCityId)?.name ?? `도시 ${destCityId}`;

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
