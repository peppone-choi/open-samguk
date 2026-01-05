import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";

export abstract class GeneralSpecialResetCommand extends GeneralCommand {
  protected abstract readonly specialType: "special" | "special2";
  protected abstract readonly specAgeType: "specAge" | "specAge2";
  protected abstract readonly specialText: string;

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    const general = snapshot.generals[actorId];
    if (!general) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const oldSpecial = general[this.specialType];
    if (oldSpecial === "None") {
      return {
        logs: {
          general: { [actorId]: [`${this.specialText}가 없습니다.`] },
        },
      };
    }

    // 레거시: auxVar에 이전 특기 목록 저장 로직은 Phase H(영속화) 이후 구체화 예정
    // 여기서는 단순히 특기 초기화 및 획득 나이 갱신만 수행합니다.

    return {
      generals: {
        [actorId]: {
          [this.specialType]: "None",
          [this.specAgeType]: general.age + 1,
        },
      },
      logs: {
        general: {
          [actorId]: [`새로운 ${this.specialText}를 가질 준비가 되었습니다.`],
        },
      },
    };
  }
}

/**
 * 내정 특기 초기화
 * 레거시: che_내정특기초기화
 */
export class GeneralDomesticSkillResetCommand extends GeneralSpecialResetCommand {
  readonly actionName = "내정 특기 초기화";
  protected readonly specialType = "special";
  protected readonly specAgeType = "specAge";
  protected readonly specialText = "내정 특기";
}

/**
 * 전투 특기 초기화
 * 레거시: che_전투특기초기화
 */
export class GeneralWarSkillResetCommand extends GeneralSpecialResetCommand {
  readonly actionName = "전투 특기 초기화";
  protected readonly specialType = "special2";
  protected readonly specAgeType = "specAge2";
  protected readonly specialText = "전투 특기";
}
