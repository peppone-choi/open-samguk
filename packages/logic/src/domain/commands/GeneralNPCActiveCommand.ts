import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * NPC 능동 커맨드
 * 레거시: che_NPC능동
 *
 * NPC 전용 명령으로, 현재는 순간이동(워프)만 지원
 * args.optionText = "순간이동"
 * args.destCityID = 목표 도시 ID
 */
export class GeneralNPCActiveCommand extends GeneralCommand {
  readonly actionName = "NPC능동";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.MustBeNPC()];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(
    _rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, unknown>
  ): WorldDelta {
    const general = snapshot.generals[actorId];
    if (!general) {
      return {
        logs: {
          general: {
            [actorId]: ["NPC능동 실패: 장수를 찾을 수 없습니다."],
          },
        },
      };
    }

    const optionText = args.optionText as string | undefined;

    if (optionText === "순간이동") {
      const destCityId = args.destCityID as number | undefined;
      if (!destCityId) {
        return {
          logs: {
            general: {
              [actorId]: ["NPC능동 실패: 목표 도시가 지정되지 않았습니다."],
            },
          },
        };
      }

      const destCity = snapshot.cities[destCityId];
      if (!destCity) {
        return {
          logs: {
            general: {
              [actorId]: ["NPC능동 실패: 목표 도시를 찾을 수 없습니다."],
            },
          },
        };
      }

      return {
        generals: {
          [actorId]: {
            cityId: destCityId,
          },
        },
        logs: {
          general: {
            [actorId]: [`NPC 전용 명령을 이용해 ${destCity.name}(으)로 이동했습니다.`],
          },
        },
      };
    }

    return {
      logs: {
        general: {
          [actorId]: [`NPC능동 실패: 알 수 없는 옵션 (${optionText})`],
        },
      },
    };
  }
}
