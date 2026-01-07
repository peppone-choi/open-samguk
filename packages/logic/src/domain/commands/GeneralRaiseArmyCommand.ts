import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 거병 커맨드
 * 레거시: che_거병
 * 재야 상태에서 공백지에서 방랑군(level 0)을 창설함
 */
export class GeneralRaiseArmyCommand extends GeneralCommand {
  readonly actionName = "거병";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.BeNeutral()];
    this.fullConditionConstraints = [...this.minConditionConstraints];
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
            [actorId]: [`거병 실패: ${check.reason}`],
          },
        },
      };
    }

    const { nationName, color } = args;
    if (!nationName || typeof nationName !== "string" || nationName.length < 1) {
      return {
        logs: {
          general: { [actorId]: ["거병 실패: 군호가 올바르지 않습니다."] },
        },
      };
    }
    if (!color || typeof color !== "string") {
      return {
        logs: {
          general: { [actorId]: ["거병 실패: 색상이 올바르지 않습니다."] },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const cityId = iGeneral.cityId;
    const iCity = snapshot.cities[cityId];

    if (iCity.nationId !== 0) {
      return {
        logs: {
          general: {
            [actorId]: ["거병 실패: 공백지에서만 거병할 수 있습니다."],
          },
        },
      };
    }

    // 거병 비용 (건국과 동일하거나 별도 상수가 필요할 수 있음, 여기서는 일단 foundNationCost 사용)
    if (iGeneral.gold < GameConst.foundNationCost) {
      return {
        logs: {
          general: {
            [actorId]: [`거병 실패: 금이 부족합니다. (필요: ${GameConst.foundNationCost})`],
          },
        },
      };
    }

    // 신규 국가 ID 생성
    const existIds = Object.keys(snapshot.nations).map(Number);
    const newNationId = existIds.length > 0 ? Math.max(...existIds) + 1 : 1;

    return {
      nations: {
        [newNationId]: {
          id: newNationId,
          name: nationName,
          color: color,
          capitalCityId: cityId,
          gold: 0,
          rice: 0,
          rate: 10,
          rateTmp: 10,
          tech: 0,
          power: 0,
          level: 0, // 방랑군
          typeCode: "che_중립",
          scoutLevel: 0,
          warState: 0,
          strategicCmdLimit: 36,
          surrenderLimit: 72,
          spy: {},
          meta: {},
        },
      },
      cities: {
        [cityId]: {
          nationId: newNationId,
          supply: 1,
        },
      },
      generals: {
        [actorId]: {
          nationId: newNationId,
          officerLevel: 12, // 군주
          gold: iGeneral.gold - GameConst.foundNationCost,
          experience: iGeneral.experience + 300,
          dedication: 500,
        },
      },
      logs: {
        general: {
          [actorId]: [`${nationName}군을 거병하였습니다!`],
        },
        global: [`${iGeneral.name} 장수가 ${iCity.name}에서 ${nationName}군을 거병하였습니다.`],
      },
    };
  }
}
