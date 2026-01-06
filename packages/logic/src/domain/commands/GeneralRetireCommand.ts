import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 은퇴 커맨드 - 60세 이상 장수가 은퇴하여 환생
 * 레거시: che_은퇴
 */
export class GeneralRetireCommand extends GeneralCommand {
  readonly actionName = "은퇴";
  static readonly reqAge = 60;

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.ReqGeneralValue(
        "age",
        "나이",
        ">=",
        GeneralRetireCommand.reqAge,
      ),
    ];
  }

  getPreReqTurn(): number {
    return 1; // 2턴 필요
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
            [actorId]: [`은퇴 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];

    if (iGeneral.age < GeneralRetireCommand.reqAge) {
      return {
        logs: {
          general: {
            [actorId]: [
              `은퇴 실패: 나이가 ${GeneralRetireCommand.reqAge}세 이상이어야 합니다.`,
            ],
          },
        },
      };
    }

    // 은퇴 시 환생 처리 (간소화)
    return {
      generals: {
        [actorId]: {
          // 환생 시 초기화되는 값들
          nationId: 0,
          officerLevel: 0,
          age: 20, // 새 나이
          // TODO: 유산 포인트 처리
        },
      },
      logs: {
        general: {
          [actorId]: ["은퇴하였습니다."],
        },
        global: [`${iGeneral.name} 장수가 은퇴하였습니다.`],
      },
    };
  }
}
