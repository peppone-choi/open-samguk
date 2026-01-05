import { RandUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { SightseeingMessage, SightseeingType } from "../SightseeingMessage.js";

/**
 * 견문 커맨드
 * 레거시: che_견문
 */
export class GeneralSightseeingCommand extends GeneralCommand {
  readonly actionName = "견문";

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const sightseeing = new SightseeingMessage();
    let { type, text } = sightseeing.pickAction(rng);

    const general = new General(iGeneral);
    const deltas: any[] = [];

    let exp = 0;

    if (type & SightseeingType.IncExp) {
      exp += 30;
    }
    if (type & SightseeingType.IncHeavyExp) {
      exp += 60;
    }
    if (type & SightseeingType.IncLeadership) {
      deltas.push(general.addStatExp("leadershipExp", 2));
    }
    if (type & SightseeingType.IncStrength) {
      deltas.push(general.addStatExp("strengthExp", 2));
    }
    if (type & SightseeingType.IncIntel) {
      deltas.push(general.addStatExp("intelExp", 2));
    }
    if (type & SightseeingType.IncGold) {
      deltas.push(general.addGold(300));
      text = text.replace(":goldAmount:", "300");
    }
    if (type & SightseeingType.IncRice) {
      deltas.push(general.addRice(300));
      text = text.replace(":riceAmount:", "300");
    }
    if (type & SightseeingType.DecGold) {
      deltas.push(general.addGold(-200));
      text = text.replace(":goldAmount:", "200");
    }
    if (type & SightseeingType.DecRice) {
      deltas.push(general.addRice(-200));
      text = text.replace(":riceAmount:", "200");
    }
    if (type & SightseeingType.Wounded) {
      deltas.push(general.addInjury(rng.nextRangeInt(10, 20)));
    }
    if (type & SightseeingType.HeavyWounded) {
      deltas.push(general.addInjury(rng.nextRangeInt(20, 50)));
    }

    if (exp > 0) {
      deltas.push(general.addExperience(exp));
    }

    // 결과 델타 통합
    const combinedDelta = deltas.reduce((acc, d) => ({ ...acc, ...d }), {});

    return {
      generals: {
        [actorId]: combinedDelta,
      },
      logs: {
        general: {
          [actorId]: [text],
        },
      },
    };
  }
}
