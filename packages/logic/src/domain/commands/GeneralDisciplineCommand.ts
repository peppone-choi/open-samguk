import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 단련 커맨드
 * 레거시: che_단련
 */
export class GeneralDisciplineCommand extends GeneralCommand {
  readonly actionName = "단련";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.ReqGeneralCrew(),
    ];
    // 정적 비용 제약은 run에서 동적으로 처리하거나 getCost 활용
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const cost = snapshot.env["develcost"] ?? 20;

    // 비용 제약 확인
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    if (iGeneral.gold < cost || iGeneral.rice < cost) {
      return {
        logs: {
          general: {
            [actorId]: [`단련 실패: 자원(금/곡)이 부족합니다. (각 ${cost} 필요)`],
          },
        },
      };
    }

    // 제약 확인
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`단련 실패: ${check.reason}`],
          },
        },
      };
    }

    // 성공 여부 및 배율 결정
    const [pick, multiplier] = rng.choiceUsingWeightPair([
      [["success", 3], 0.34],
      [["normal", 2], 0.33],
      [["fail", 1], 0.33],
    ]);

    // 숙련도 획득량 계산
    let dexGain = Math.round((iGeneral.crew * iGeneral.train * iGeneral.atmos) / 20 / 10000);
    dexGain *= multiplier;

    // 가중치에 따른 상승 스탯 결정
    const incStatKey = rng.choiceUsingWeight({
      leadershipExp: iGeneral.leadership,
      strengthExp: iGeneral.strength,
      intelExp: iGeneral.intel,
    }) as "leadershipExp" | "strengthExp" | "intelExp";

    // DDD: 도메인 모델 활용
    const general = new General(iGeneral);
    const generalDelta = general.discipline(incStatKey, dexGain, cost, cost);

    const logs = [];
    if (pick === "fail") {
      logs.push(`단련이 지지부진하여 숙련도가 ${dexGain} 향상되었습니다.`);
    } else if (pick === "success") {
      logs.push(`단련이 일취월장하여 숙련도가 ${dexGain} 향상되었습니다.`);
    } else {
      logs.push(`단련을 통해 숙련도가 ${dexGain} 향상되었습니다.`);
    }

    return {
      generals: {
        [actorId]: generalDelta,
      },
      logs: {
        general: {
          [actorId]: logs,
        },
      },
    };
  }
}
