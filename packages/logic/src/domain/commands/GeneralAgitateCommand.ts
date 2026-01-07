import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 선동(Agitate) 커맨드
 * 레거시: che_선동
 */
export class GeneralAgitateCommand extends GeneralCommand {
  override readonly actionName = "선동";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.OccupiedCity(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NearCity(),
      ConstraintHelper.ReqGeneralGold(100), // 임시 비용
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
            [actorId]: [`선동 실패: ${check.reason}`],
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
            [actorId]: ["선동 실패: 아군 도시는 선동할 수 없습니다."],
          },
        },
      };
    }

    // 성공 확률: (지력 * 0.4 + 매력 * 0.1) + 20
    // 상대 도시 치안이 높으면 확률 감소
    let successRate = iGeneral.intel * 0.4 + (iGeneral.charm || iGeneral.politics) * 0.1 + 20; // charm 필드 없으면 politics 대용
    successRate -= iDestCity.secu / 10;

    const roll = rng.nextRange(0, 100);
    const isSuccess = roll < successRate;

    if (!isSuccess) {
      return {
        generals: {
          [actorId]: {
            experience: iGeneral.experience + 10,
          },
        },
        logs: {
          general: {
            [actorId]: [`${iDestCity.name} 주민들을 선동하려 했으나 실패했습니다.`],
          },
        },
      };
    }

    // 피해량 계산
    const damage = Math.floor(iGeneral.intel * 1.0 + rng.nextRange(5, 20));
    const secuDamage = damage;
    const popDamage = damage * 20;

    const newSecu = Math.max(0, iDestCity.secu - secuDamage);
    const newPop = Math.max(0, iDestCity.pop - popDamage);

    return {
      generals: {
        [actorId]: {
          experience: iGeneral.experience + 40,
          dedication: iGeneral.dedication + 3,
        },
      },
      cities: {
        [destCityId]: {
          secu: newSecu,
          pop: newPop,
        },
      },
      logs: {
        general: {
          [actorId]: [
            `${iDestCity.name} 주민들을 선동하여 혼란에 빠뜨렸습니다! (치안 -${secuDamage}, 인구 -${popDamage})`,
          ],
        },
      },
    };
  }
}
