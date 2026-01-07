import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta, General as IGeneral, Delta } from "../entities.js";
import { General } from "../models/General.js";

/**
 * 집합 커맨드
 * 레거시: che_집합
 */
export class GeneralAssembleCommand extends GeneralCommand {
  readonly actionName = "집합";

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    // 리더인지 확인 (troopId가 자신의 ID여야 함)
    if (iGeneral.troopId !== actorId) {
      // 실제로는 Constraint에서 걸러져야 함
      throw new Error("부대 리더만 집합 명령을 내릴 수 있습니다.");
    }

    const general = new General(iGeneral);
    const troopId = iGeneral.id;
    const cityId = iGeneral.cityId;
    const nationId = iGeneral.nationId;

    const troopMembers = Object.values(snapshot.generals).filter(
      (g) =>
        g.nationId === nationId && g.cityId !== cityId && g.troopId === troopId && g.id !== actorId
    );

    const gDelta: Delta<IGeneral> = {
      ...general.addStatExp("leadershipExp", 1),
      ...general.addExperience(70),
      ...general.addDedication(100),
    };

    const delta: WorldDelta = {
      generals: {
        [actorId]: gDelta,
      },
      logs: {
        general: {
          [actorId]: [`현재 도시로 부대원들을 집합시켰습니다.`],
        },
      },
    };

    for (const member of troopMembers) {
      if (!delta.generals) delta.generals = {};
      delta.generals[member.id] = {
        cityId: cityId,
      };

      if (!delta.logs) delta.logs = {};
      if (!delta.logs.general) delta.logs.general = {};
      delta.logs.general[member.id] = [`부대장의 소집에 의해 현재 도시로 집합되었습니다.`];
    }

    return delta;
  }
}
