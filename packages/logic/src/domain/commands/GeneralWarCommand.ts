import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { WarEngine } from "../WarEngine.js";

/**
 * 출격 커맨드 (레거시: che_출격)
 * 자국 영토에서 인접한 적 영토로 부대를 출전시켜 전투를 개시합니다.
 */
export class GeneralWarCommand extends GeneralCommand {
  readonly actionName = "출격";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.NotBeNeutral(), // 재야는 출격 불가
      ConstraintHelper.OccupiedCity(), // 현재 도시에 머물러야 함
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NearCity(), // 인접한 도시에만 출격 가능
      ConstraintHelper.ReqGeneralCrew(), // 병사가 있어야 함
    ];
  }

  /**
   * 출격 명령을 실행합니다.
   * WarEngine을 호출하여 전투 결과를 계산하고 델타를 반환합니다.
   * 
   * @param rng 난수 생성기
   * @param snapshot 월드 스냅샷
   * @param actorId 장수 ID
   * @param args { destCityId: 공격 대상 도시 ID }
   * @returns 전투 결과가 포함된 상태 변경 델타
   */
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

    const warEngine = new WarEngine();
    const result = warEngine.execute(rng, snapshot, actorId, destCityId);

    const delta = result.delta;
    delta.logs = delta.logs || { general: {}, global: [] };
    delta.logs.general = delta.logs.general || {};
    delta.logs.general[actorId] = result.battleLog;

    return delta;
  }
}
