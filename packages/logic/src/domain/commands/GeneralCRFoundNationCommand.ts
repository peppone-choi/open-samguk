import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 건국 커맨드 (Current Region)
 * 레거시: cr_건국
 * 현재 위치한 도시에서 건국 (중립 도시 필요)
 */
export class GeneralCRFoundNationCommand extends GeneralCommand {
  readonly actionName = "건국";

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
      ConstraintHelper.NeutralCity(), // 중립 도시여야 함
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
        logs: { general: { [actorId]: [`건국 실패: ${check.reason}`] } },
      };
    }

    // 이름 중복 체크
    const isDuplicate = Object.values(snapshot.nations).some((n) => n.name === nationName);
    if (isDuplicate) {
      return {
        logs: {
          general: { [actorId]: [`건국 실패: 이미 존재하는 국가명입니다.`] },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iNation = snapshot.nations[iGeneral.nationId];
    if (!iNation) throw new Error(`국가 ${iGeneral.nationId}를 찾을 수 없습니다.`);

    const iCity = snapshot.cities[iGeneral.cityId];
    if (!iCity) throw new Error(`도시 ${iGeneral.cityId}를 찾을 수 없습니다.`);

    // Verify city is neutral
    if (iCity.nationId !== 0) {
      return {
        logs: {
          general: {
            [actorId]: ["건국 실패: 중립 도시에서만 건국할 수 있습니다."],
          },
        },
      };
    }

    const general = new General(iGeneral);
    general.addExperience(1000);
    general.addDedication(1000);

    const nationDelta = {
      [iGeneral.nationId]: {
        name: nationName,
        color: colorType,
        level: 1, // 방랑군(0)에서 정식국가(1)로
        typeCode: nationType,
        capitalCityId: iGeneral.cityId,
        meta: {
          ...iNation.meta,
          can_국기변경: 1,
        },
      },
    };

    const cityDelta = {
      [iGeneral.cityId]: {
        nationId: iGeneral.nationId,
        conflict: {}, // 교전 상태 초기화
      },
    };

    const josaUl = JosaUtil.pick(nationName, "을");
    const josaYi = JosaUtil.pick(iGeneral.name, "이");
    const josaNationYi = JosaUtil.pick(nationName, "이");

    return {
      generals: { [actorId]: general.toJSON() },
      nations: nationDelta,
      cities: cityDelta,
      logs: {
        general: { [actorId]: [`【${nationName}】${josaUl} 건국하였습니다.`] },
        nation: {
          [iGeneral.nationId]: [`${iGeneral.name}${josaYi} 【${nationName}】${josaUl} 건국`],
        },
        global: [
          `${iGeneral.name}${josaYi} ${iCity.name}에 국가를 건설하였습니다.`,
          `【건국】${nationName}${josaNationYi} 새로이 등장하였습니다.`,
        ],
      },
    };
  }
}
