import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 국기변경 커맨드
 * 레거시: che_국기변경 (국가 커맨드이나 장수가 실행)
 */
export class NationChangeColorCommand extends GeneralCommand {
  readonly actionName = "국기변경";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.BeLord(),
      ConstraintHelper.ReqNationMeta(
        "can_국기변경",
        0,
        "gt",
        "더이상 변경이 불가능합니다.",
      ),
    ];
    this.fullConditionConstraints = [...this.minConditionConstraints];
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
            [actorId]: [`국기변경 실패: ${check.reason}`],
          },
        },
      };
    }

    const { colorType } = args;
    if (colorType === undefined || typeof colorType !== "number") {
      return {
        logs: {
          general: {
            [actorId]: ["국기변경 실패: 변경할 색상이 지정되지 않았습니다."],
          },
        },
      };
    }

    const newColor = GameConst.nationColors[colorType];
    if (!newColor) {
      return {
        logs: {
          general: {
            [actorId]: ["국기변경 실패: 유효하지 않은 색상 타입입니다."],
          },
        },
      };
    }

    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return {
        logs: {
          global: [
            `장수 ${actorId}를 찾을 수 없어 국기변경을 실행할 수 없습니다.`,
          ],
        },
      };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: {
            [actorId]: ["국기변경 실패: 소속 국가 정보를 찾을 수 없습니다."],
          },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const josaYiNation = JosaUtil.pick(iNation.name, "이");

    const colorSpan = (text: string) =>
      `<span style='color:${newColor};'><b>${text}</b></span>`;

    return {
      nations: {
        [iNation.id]: {
          color: newColor,
          meta: {
            ...iNation.meta,
            can_국기변경: 0,
          },
        },
      },
      generals: {
        [actorId]: {
          experience: iActor.experience + 5,
          dedication: iActor.dedication + 5,
        },
      },
      logs: {
        general: {
          [actorId]: [`${colorSpan("국기")}를 변경하였습니다.`],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYi} ${colorSpan("국기")}를 변경하였습니다.`,
          ],
        },
        global: [
          `${iActor.name}${josaYi} ${colorSpan("국기")}를 변경하였습니다.`,
          `【국기변경】 ${iNation.name}${josaYiNation} ${colorSpan("국기")}를 변경하였습니다.`,
        ],
      },
    };
  }
}
