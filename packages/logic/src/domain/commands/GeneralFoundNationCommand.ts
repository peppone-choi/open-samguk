import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";

/**
 * 건국 커맨드
 * 레거시: che_건국
 */
export class GeneralFoundNationCommand extends GeneralCommand {
  readonly actionName = "건국";

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.NoPenalty("NoFoundNation")];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.BeLord(),
      ConstraintHelper.WanderingNation(),
      ConstraintHelper.ReqNationGeneralCount(2),
      ConstraintHelper.ConstructableCity(),
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
        meta: { ...iNation.meta, can_국기변경: 1 },
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

    return {
      generals: { [actorId]: general.toJSON() },
      nations: nationDelta,
      cities: cityDelta,
      logs: {
        general: { [actorId]: [`【${nationName}】${josaUl} 건국하였습니다.`] },
        global: [
          `${iGeneral.name}${josaYi} 【${snapshot.cities[iGeneral.cityId]?.name}】에 국가를 건국하였습니다.`,
        ],
      },
    };
  }
}
