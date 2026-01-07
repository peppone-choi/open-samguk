import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";

/**
 * 휴식 커맨드
 * 레거시: 아무것도 수행하지 않고 로그만 남김
 */
export class GeneralRestCommand extends GeneralCommand {
  readonly actionName = "휴식";

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    // 레거시와 동일하게 상태 변화는 없으나 로그는 엔진 레이어에서 처리할 예정이므로
    // 여기서는 빈 Delta를 반환합니다.
    return {
      generals: {
        [actorId]: {}, // 변경 없음
      },
    };
  }
}
