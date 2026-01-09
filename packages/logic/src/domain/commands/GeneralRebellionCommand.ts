import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 모반시도 커맨드
 * 레거시: che_모반시도
 */
export class GeneralRebellionCommand extends GeneralCommand {
  readonly actionName = "모반시도";

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.SuppliedCity(),
      ConstraintHelper.NotLord(),
      ConstraintHelper.AllowRebellion(),
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
            [actorId]: [`모반시도 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const nationId = iGeneral.nationId;

    if (!nationId) {
      return {
        logs: {
          general: {
            [actorId]: ["모반시도 실패: 국가에 소속되어 있지 않습니다."],
          },
        },
      };
    }

    const iNation = snapshot.nations[nationId];
    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: ["모반시도 실패: 국가를 찾을 수 없습니다."] },
        },
      };
    }

    // Find the lord (officer_level = 12)
    const lordId = Object.keys(snapshot.generals)
      .map(Number)
      .find((gid) => {
        const g = snapshot.generals[gid];
        return g.nationId === nationId && g.officerLevel === 12;
      });

    if (!lordId) {
      return {
        logs: {
          general: { [actorId]: ["모반시도 실패: 군주를 찾을 수 없습니다."] },
        },
      };
    }

    const iLord = snapshot.generals[lordId];
    const generalName = iGeneral.name;
    const lordName = iLord.name;
    const nationName = iNation.name;

    return {
      generals: {
        [actorId]: {
          officerLevel: 12,
          officerCity: 0,
        },
        [lordId]: {
          officerLevel: 1,
          officerCity: 0,
          experience: Math.floor((iLord.experience ?? 0) * 0.7),
        },
      },
      logs: {
        general: {
          [actorId]: [`모반에 성공했습니다.`],
          [lordId]: [`${generalName}에게 군주의 자리를 뺏겼습니다.`],
        },
        nation: {
          [nationId]: [`${generalName}이(가) ${lordName}에게서 군주자리를 찬탈`],
        },
        global: [`【모반】${generalName}이(가) ${nationName}의 군주 자리를 찬탈했습니다.`],
      },
    };
  }
}
