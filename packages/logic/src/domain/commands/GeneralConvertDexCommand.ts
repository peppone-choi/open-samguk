import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 숙련전환 커맨드
 * 레거시: che_숙련전환
 */
export class GeneralConvertDexCommand extends GeneralCommand {
  readonly actionName = "숙련전환";

  static readonly DECREASE_COEFF = 0.4;
  static readonly CONVERT_COEFF = 0.9;

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const develcost = snapshot.env.develcost ?? 100;
    const reqGold = develcost;
    const reqRice = develcost;

    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: { general: { [actorId]: [`숙련전환 실패: ${check.reason}`] } },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);
    if (iGeneral.gold < reqGold || iGeneral.rice < reqRice) {
      return {
        logs: {
          general: {
            [actorId]: [`숙련전환 실패: 자금이나 군량이 부족합니다.`],
          },
        },
      };
    }

    const { srcArmType, destArmType } = args;
    if (srcArmType === undefined || destArmType === undefined || srcArmType === destArmType) {
      return {
        logs: {
          general: { [actorId]: [`숙련전환 실패: 잘못된 병종 선택입니다.`] },
        },
      };
    }

    const general = new General(iGeneral);
    const {
      cutDex,
      addDex,
      delta: dexDelta,
    } = general.convertDex(
      srcArmType,
      destArmType,
      GeneralConvertDexCommand.DECREASE_COEFF,
      GeneralConvertDexCommand.CONVERT_COEFF
    );

    general.addExperience(10);
    general.addStatExp("leadershipExp", 2);
    general.addGold(-reqGold);
    general.addRice(-reqRice);

    // TODO: 유니크 아이템 추첨 (tryUniqueItemLottery)

    return {
      generals: { [actorId]: general.toJSON() },
      logs: {
        general: {
          [actorId]: [
            `병종${srcArmType} 숙련 ${cutDex.toLocaleString()}을 병종${destArmType} 숙련 ${addDex.toLocaleString()}(으)로 전환했습니다.`,
          ],
        },
      },
    };
  }
}
