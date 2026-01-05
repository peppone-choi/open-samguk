import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 맹훈련 커맨드 - 훈련과 사기를 동시에 올리는 강화 훈련
 * 레거시: cr_맹훈련
 *
 * 비용: 군량 500
 * 효과: 훈련/사기 동시 상승, 통솔 경험치 +1, 숙련도 증가
 */
export class GeneralHardTrainingCommand extends GeneralCommand {
  readonly actionName = "맹훈련";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.NotWanderingNation(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ReqGeneralCrew(),
      ConstraintHelper.ReqGeneralTrainMargin(GameConst.maxTrainByCommand),
      ConstraintHelper.ReqGeneralRice(500), // 군량 500 필요
    ];
  }

  getCost(): { gold: number; rice: number } {
    return { gold: 0, rice: 500 };
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, unknown>,
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`맹훈련 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    // 훈련/사기 상승량 계산
    // 레거시: leadership * 100 / crew * trainDelta * 2/3
    const score = Math.round(
      (((iGeneral.leadership * 100) / iGeneral.crew) *
        GameConst.trainDelta *
        2) /
        3,
    );

    const newTrain = Math.min(
      iGeneral.train + score,
      GameConst.maxTrainByCommand,
    );
    const newAtmos = Math.min(
      iGeneral.atmos + score,
      GameConst.maxAtmosByCommand,
    );

    // 경험치, 기여도
    const exp = 150;
    const ded = 100;

    // 숙련도 증가 (현재 병종에 대해)
    const crewType = iGeneral.crewType;
    const currentDex = iGeneral.dex[crewType] ?? 0;
    const newDex = currentDex + score * 2;

    return {
      generals: {
        [actorId]: {
          train: newTrain,
          atmos: newAtmos,
          experience: iGeneral.experience + exp,
          dedication: iGeneral.dedication + ded,
          leadershipExp: iGeneral.leadershipExp + 1,
          rice: iGeneral.rice - 500,
          dex: { ...iGeneral.dex, [crewType]: newDex },
        },
      },
      logs: {
        general: {
          [actorId]: [`훈련, 사기치가 ${score} 상승했습니다.`],
        },
      },
    };
  }
}
