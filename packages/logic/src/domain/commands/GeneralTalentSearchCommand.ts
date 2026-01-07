import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 인재 탐색 커맨드
 * 레거시: che_인재탐색
 */
export class GeneralTalentSearchCommand extends GeneralCommand {
  readonly actionName = "인재탐색";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ReqGeneralGold(50),
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
            [actorId]: [`인재탐색 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) {
      return {
        logs: {
          global: [`장수 ${actorId}를 찾을 수 없어 인재탐색을 실행할 수 없습니다.`],
        },
      };
    }

    // 레거시: 확률 계산 (간소화)
    // 실제로는 maxgeneral, totalGenCnt 등을 고려해야 함
    const foundProp = 1.0; // 테스트를 위해 100%로 임시 설정
    const isFound = rng.nextBool(foundProp);

    const general = new General(iGeneral);
    const costGold = 50; // 임시 비용

    if (!isFound) {
      // 발견 실패 시 경험치와 랜덤 스탯 증가
      const statToInc = rng.choice([
        "leadershipExp",
        "strengthExp",
        "intelExp",
        "politicsExp",
        "charmExp",
      ] as const);

      const generalDelta = {
        gold: Math.max(iGeneral.gold - costGold, 0),
        experience: iGeneral.experience + 100,
        dedication: iGeneral.dedication + 70,
        [statToInc]: (iGeneral[statToInc] as number) + 1,
      };

      return {
        generals: { [actorId]: generalDelta },
        logs: {
          general: { [actorId]: ["인재를 찾을 수 없었습니다."] },
        },
      };
    }

    // 발견 성공 시 (현재는 금 발견으로 대체)
    const goldFound = rng.nextRangeInt(100, 500);

    return {
      generals: {
        [actorId]: {
          gold: iGeneral.gold - costGold + goldFound,
          experience: iGeneral.experience + 200,
          dedication: iGeneral.dedication + 300,
        },
      },
      logs: {
        general: {
          [actorId]: [`숨겨진 자금 ${goldFound}금을 발견하였습니다!`],
        },
      },
    };
  }
}
