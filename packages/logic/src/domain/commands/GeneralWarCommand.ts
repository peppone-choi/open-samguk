import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 출격 커맨드
 * 레거시: che_출격
 */
export class GeneralWarCommand extends GeneralCommand {
  readonly actionName = "출격";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NearCity(),
      ConstraintHelper.ReqGeneralCrew(),
    ];
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
            [actorId]: [`출격 실패: ${check.reason}`],
          },
        },
      };
    }

    const { destCityId } = args;
    const iGeneral = snapshot.generals[actorId];
    const iDestCity = snapshot.cities[destCityId];

    if (iDestCity.nationId === iGeneral.nationId) {
      return {
        logs: {
          general: {
            [actorId]: ["출격 실패: 자국 도시는 공격할 수 없습니다."],
          },
        },
      };
    }

    // 매우 단순화된 전투 로직
    const attackerPower =
      iGeneral.leadership + iGeneral.strength + iGeneral.crew / 100;
    const defenderPower = iDestCity.def + iDestCity.wall + iDestCity.pop / 1000;

    const attackerLoss = Math.floor(defenderPower / 10);
    const defenderLoss = Math.floor(attackerPower / 5);

    const newAttackerCrew = Math.max(iGeneral.crew - attackerLoss, 0);
    const newDefenderDef = Math.max(iDestCity.def - defenderLoss, 0);

    const isCaptured = newDefenderDef <= 0;

    const delta: WorldDelta = {
      generals: {
        [actorId]: {
          crew: newAttackerCrew,
          experience: iGeneral.experience + 200,
          recentWar: snapshot.gameTime.year * 12 + snapshot.gameTime.month,
        },
      },
      cities: {
        [destCityId]: {
          def: newDefenderDef,
        },
      },
      logs: {
        general: {
          [actorId]: [
            `병사 ${attackerLoss}명을 잃고 ${iDestCity.name}을 공격했습니다.`,
            isCaptured
              ? `${iDestCity.name}을 점령했습니다!`
              : `${iDestCity.name}의 수비를 ${defenderLoss} 깎았습니다.`,
          ],
        },
      },
    };

    if (isCaptured) {
      delta.cities![destCityId].nationId = iGeneral.nationId;
      delta.cities![destCityId].def = 500; // 점령 후 기본 수비
    }

    return delta;
  }
}
