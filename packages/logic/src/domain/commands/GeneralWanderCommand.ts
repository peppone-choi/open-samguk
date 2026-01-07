import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 방랑 커맨드
 * 레거시: che_방랑
 */
export class GeneralWanderCommand extends GeneralCommand {
  readonly actionName = "방랑";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.NotBeNeutral()];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.BeLord(),
      ConstraintHelper.NotWanderingNation(),
      // TODO: NotOpeningPart, AllowDiplomacyStatus
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
        logs: { general: { [actorId]: [`방랑 실패: ${check.reason}`] } },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iNation = snapshot.nations[iGeneral.nationId];
    if (!iNation) throw new Error(`국가 ${iGeneral.nationId}를 찾을 수 없습니다.`);

    const generalName = iGeneral.name;
    const nationName = iNation.name;
    const josaYi = JosaUtil.pick(generalName, "이");
    const josaUn = JosaUtil.pick(generalName, "은");
    const josaUl = JosaUtil.pick(nationName, "을");

    const nationDelta = {
      [iGeneral.nationId]: {
        name: generalName,
        color: "#330000",
        level: 0, // 방랑군
        typeCode: "None",
        tech: 0,
        capitalCityId: 0,
      },
    };

    const cityDelta: Record<number, any> = {};
    for (const city of Object.values(snapshot.cities)) {
      if (city.nationId === iGeneral.nationId) {
        cityDelta[city.id] = {
          nationId: 0,
          conflict: {},
        };
      }
    }

    return {
      nations: nationDelta,
      cities: cityDelta,
      logs: {
        general: { [actorId]: [`영토를 버리고 방랑의 길을 떠납니다.`] },
        global: [`${generalName}${josaYi} 방랑의 길을 떠납니다.`],
      },
    };
  }
}
