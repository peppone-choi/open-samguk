import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 수몰 커맨드 - 적국 도시의 수비력과 성벽을 80% 감소
 * 레거시: che_수몰
 * Priority: 전략 커맨드
 */
export class NationFloodCommand extends GeneralCommand {
  readonly actionName = "수몰";

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.AvailableStrategicCommand(2), // preReqTurn = 2
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.NotNeutralDestCity(),
      ConstraintHelper.NotOccupiedDestCity(),
      ConstraintHelper.BattleGroundCity(),
    ];
  }

  getPreReqTurn(): number {
    return 2;
  }

  getPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    // sqrt(genCount * 4) * 10
    return Math.round(Math.sqrt(genCount * 4) * 10);
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const iActor = snapshot.generals[actorId];
    if (!iActor) {
      return { logs: { global: [`장수 ${actorId}를 찾을 수 없습니다.`] } };
    }

    const iNation = snapshot.nations[iActor.nationId];
    if (!iNation) {
      return {
        logs: {
          general: { [actorId]: ["수몰 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destCityId } = args;
    if (destCityId === undefined) {
      return {
        logs: {
          general: { [actorId]: ["수몰 실패: 대상 도시가 지정되지 않았습니다."] },
        },
      };
    }

    const iDestCity = snapshot.cities[destCityId];
    if (!iDestCity) {
      return {
        logs: {
          general: { [actorId]: ["수몰 실패: 대상 도시를 찾을 수 없습니다."] },
        },
      };
    }

    if (iDestCity.nationId === 0) {
      return {
        logs: {
          general: { [actorId]: ["수몰 실패: 공백지에는 수몰을 발동할 수 없습니다."] },
        },
      };
    }

    if (iDestCity.nationId === iNation.id) {
      return {
        logs: {
          general: { [actorId]: ["수몰 실패: 자국 도시에는 수몰을 발동할 수 없습니다."] },
        },
      };
    }

    const iDestNation = snapshot.nations[iDestCity.nationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["수몰 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    const josaYi = JosaUtil.pick(iActor.name, "이");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const newDef = Math.floor(iDestCity.def * 0.2);
    const newWall = Math.floor(iDestCity.wall * 0.2);

    const nationGeneralCount = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iNation.id
    ).length;
    const postReqTurn = this.getPostReqTurn(nationGeneralCount);

    const broadcastMessage = `<Y>${iActor.name}</>${josaYi} <G><b>${iDestCity.name}</b></>에 <M>수몰</>을 발동하였습니다.`;
    const destBroadcastMessage = `<G><b>${iDestCity.name}</b></>에 <M>수몰</>이 발동되었습니다.`;

    const generalLogs: Record<number, string[]> = {};
    Object.values(snapshot.generals).forEach((g) => {
      if (g.nationId === iNation.id && g.id !== actorId) {
        generalLogs[g.id] = [broadcastMessage];
      } else if (g.nationId === iDestCity.nationId) {
        generalLogs[g.id] = [destBroadcastMessage];
      }
    });

    return {
      generals: {
        [actorId]: {
          experience: iActor.experience + expGain,
          dedication: iActor.dedication + expGain,
          lastTurn: {
            action: this.actionName,
            destCityId,
          },
        },
        ...generalUpdatesForLogs(generalLogs), // 헬퍼 함수가 필요할 듯
      },
      cities: {
        [destCityId]: {
          def: newDef,
          wall: newWall,
        },
      },
      nations: {
        [iNation.id]: {
          strategicCmdLimit: 9,
        },
      },
      logs: {
        general: {
          [actorId]: [`【${iDestCity.name}】에 수몰을 발동했습니다.`],
          ...generalLogs,
        },
        nation: {
          [iNation.id]: [`${iActor.name}${josaYi} 【${iDestCity.name}】에 수몰을 발동`],
          [iDestNation.id]: [
            `【${iNation.name}】의 ${iActor.name}${josaYi} 아국의 【${iDestCity.name}】에 수몰을 발동`,
          ],
        },
        global: [`${iActor.name}${josaYi} 【${iDestCity.name}】에 수몰을 발동하였습니다.`],
      },
    };
  }
}

function generalUpdatesForLogs(logs: Record<number, string[]>): Record<number, any> {
  const updates: Record<number, any> = {};
  for (const id in logs) {
    updates[id] = {}; // 로그만 업데이트하므로 빈 객체 (WorldDelta.logs에서 처리됨)
  }
  return updates;
}
