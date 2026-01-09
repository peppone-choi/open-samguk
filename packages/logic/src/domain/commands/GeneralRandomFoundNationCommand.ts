import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 무작위 도시 건국 커맨드
 * 레거시: che_무작위건국
 */
export class GeneralRandomFoundNationCommand extends GeneralCommand {
  readonly actionName = "무작위 도시 건국";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.BeOpeningPart(),
      ConstraintHelper.ReqNationValue("level", "국가규모", "==", 0, "정식 국가가 아니어야합니다."),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.BeLord(),
      ConstraintHelper.WanderingNation(),
      ConstraintHelper.ReqNationGeneralCount(2),
      ConstraintHelper.AllowJoinAction(),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const { nationName, nationType, colorType } = args;

    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: { general: { [actorId]: [`무작위 건국 실패: ${check.reason}`] } },
      };
    }

    // 이름 중복 체크
    const isDuplicate = Object.values(snapshot.nations).some((n) => n.name === nationName);
    if (isDuplicate) {
      return {
        logs: {
          general: {
            [actorId]: [`무작위 건국 실패: 이미 존재하는 국가명입니다.`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iNation = snapshot.nations[iGeneral.nationId];
    if (!iNation) throw new Error(`국가 ${iGeneral.nationId}를 찾을 수 없습니다.`);

    // Find available cities (level 5-6, neutral)
    const availableCities = Object.keys(snapshot.cities)
      .map(Number)
      .filter((cityId) => {
        const city = snapshot.cities[cityId];
        return city.level >= 5 && city.level <= 6 && city.nationId === 0;
      });

    if (availableCities.length === 0) {
      return {
        logs: {
          general: {
            [actorId]: ["무작위 건국 실패: 건국할 수 있는 도시가 없습니다."],
          },
        },
      };
    }

    // Pick random city
    const targetCityId = rng.choice(availableCities);
    const targetCity = snapshot.cities[targetCityId];

    const general = new General(iGeneral);
    general.addExperience(1000);
    general.addDedication(1000);

    // Update all generals in the nation to move to the new city
    const generalsDelta: Record<number, any> = {
      [actorId]: {
        ...general.toJSON(),
        cityId: targetCityId,
      },
    };

    Object.keys(snapshot.generals)
      .map(Number)
      .forEach((gid) => {
        const g = snapshot.generals[gid];
        if (g.nationId === iGeneral.nationId && gid !== actorId) {
          generalsDelta[gid] = { cityId: targetCityId };
        }
      });

    const nationDelta = {
      [iGeneral.nationId]: {
        name: nationName,
        color: colorType,
        level: 1, // 방랑군(0)에서 정식국가(1)로
        typeCode: nationType,
        capitalCityId: targetCityId,
        meta: {
          ...iNation.meta,
          can_국기변경: 1,
          can_무작위수도이전: 1,
        },
      },
    };

    const cityDelta = {
      [targetCityId]: {
        nationId: iGeneral.nationId,
        conflict: {}, // 교전 상태 초기화
      },
    };

    const josaUl = JosaUtil.pick(nationName, "을");
    const josaYi = JosaUtil.pick(iGeneral.name, "이");
    const josaNationYi = JosaUtil.pick(nationName, "이");

    return {
      generals: generalsDelta,
      nations: nationDelta,
      cities: cityDelta,
      logs: {
        general: { [actorId]: [`【${nationName}】${josaUl} 건국하였습니다.`] },
        nation: {
          [iGeneral.nationId]: [`${iGeneral.name}${josaYi} 【${nationName}】${josaUl} 건국`],
        },
        global: [
          `${iGeneral.name}${josaYi} ${targetCity.name}에 국가를 건설하였습니다.`,
          `【건국】${nationName}${josaNationYi} 새로이 등장하였습니다.`,
        ],
      },
    };
  }
}
