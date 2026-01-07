import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";
import { NationAuxKey } from "../enums/index.js";

/**
 * 화륜차 연구 커맨드 - 화륜차(火輪車) 사용 해금
 * 레거시: event_화륜차연구
 * Cost: 금 100,000, 쌀 100,000
 * PreReqTurn: 24턴 (preReqTurn = 23)
 */
export class NationResearchJuggernautCommand extends GeneralCommand {
  readonly actionName = "화륜차 연구";
  readonly auxKey = NationAuxKey.can_화륜차사용;
  readonly reqGold = 100000;
  readonly reqRice = 100000;

  constructor() {
    super();
    this.minConditionConstraints = [ConstraintHelper.OccupiedCity(), ConstraintHelper.BeChief()];
    this.fullConditionConstraints = [...this.minConditionConstraints];
  }

  getPreReqTurn(): number {
    return 23;
  }

  getPostReqTurn(_nationGeneralCount: number): number {
    return 0;
  }

  run(
    _rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    _args: Record<string, any>
  ): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: [`${this.actionName} 실패: 소속 국가 정보를 찾을 수 없습니다.`] },
        },
      };
    }

    // 이미 연구 완료 여부 확인
    const nationAux = iNation.aux ?? {};
    if (nationAux[this.auxKey] === 1) {
      return {
        logs: {
          general: { [actorId]: [`${this.actionName} 실패: 이미 연구가 완료되었습니다.`] },
        },
      };
    }

    // 자원 확인
    if (iNation.gold < GameConst.minNationalGold + this.reqGold) {
      return {
        logs: {
          general: { [actorId]: [`${this.actionName} 실패: 금이 부족합니다.`] },
        },
      };
    }
    if (iNation.rice < GameConst.minNationalRice + this.reqRice) {
      return {
        logs: {
          general: { [actorId]: [`${this.actionName} 실패: 쌀이 부족합니다.`] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const newAux = { ...nationAux, [this.auxKey]: 1 };

    return {
      generals: {
        [actorId]: {
          experience: iActor.experience + expGain,
          dedication: iActor.dedication + expGain,
          lastTurn: {
            action: this.actionName,
            postReqTurn: 0,
          },
        },
      },
      nations: {
        [iNation.id]: {
          gold: iNation.gold - this.reqGold,
          rice: iNation.rice - this.reqRice,
          aux: newAux,
        },
      },
      logs: {
        general: {
          [actorId]: [`<M>${this.actionName}</> 완료`],
        },
        nation: {
          [iNation.id]: [`<Y>${iActor.name}</>${josaYi} <M>${this.actionName}</> 완료`],
        },
      },
    };
  }
}
