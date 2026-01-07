import { RandUtil, JosaUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 피장파장 커맨드 - 적국에 특정 전략 커맨드의 재사용 대기 시간을 증가시킴
 * 레거시: che_피장파장
 * Priority: 전략 커맨드
 */
export class NationRetaliationCommand extends GeneralCommand {
  readonly actionName = "피장파장";
  static readonly DELAY_COUNT = 60;

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.BeChief(),
      ConstraintHelper.NotBeNeutral(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsDestNation(),
      ConstraintHelper.AllowDiplomacyBetweenStatus(
        [0, 1],
        "선포, 전쟁중인 상대국에게만 가능합니다."
      ),
      ConstraintHelper.AvailableStrategicCommand(1), // preReqTurn + 1 = 2 턴 이상 남아야 함 (레거시 패턴)
      ConstraintHelper.AvailableNationCommand("NationRetaliationCommand"),
    ];
  }

  getPreReqTurn(): number {
    return 1;
  }

  getPostReqTurn(): number {
    return 8;
  }

  getTargetPostReqTurn(nationGeneralCount: number): number {
    const genCount = Math.max(nationGeneralCount, GameConst.initialNationGenLimit);
    // sqrt(genCount * 2) * 10
    return Math.round(Math.sqrt(genCount * 2) * 10);
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
          general: { [actorId]: ["피장파장 실패: 소속 국가 정보를 찾을 수 없습니다."] },
        },
      };
    }

    const { destNationId, commandType } = args;
    if (destNationId === undefined || commandType === undefined) {
      return {
        logs: {
          general: {
            [actorId]: ["피장파장 실패: 대상 국가 또는 커맨드 타입이 지정되지 않았습니다."],
          },
        },
      };
    }

    const iDestNation = snapshot.nations[destNationId];
    if (!iDestNation) {
      return {
        logs: {
          general: { [actorId]: ["피장파장 실패: 대상 국가를 찾을 수 없습니다."] },
        },
      };
    }

    // 외교 관계 확인 (수동 확인 - 제약조건에서 이미 걸러졌을 것이나 run에서도 보장)
    const diplomacyKey = `${iNation.id}:${destNationId}`;
    const reverseDiplomacyKey = `${destNationId}:${iNation.id}`;
    const iDiplomacy = snapshot.diplomacy[diplomacyKey] || snapshot.diplomacy[reverseDiplomacyKey];

    if (!iDiplomacy || (iDiplomacy.state !== "0" && iDiplomacy.state !== "1")) {
      return {
        logs: {
          general: { [actorId]: ["피장파장 실패: 선포 또는 전쟁중인 상대국에게만 가능합니다."] },
        },
      };
    }

    const yearMonth = snapshot.gameTime.year * 12 + snapshot.gameTime.month;
    const josaYi = JosaUtil.pick(iActor.name, "이");
    const preReqTurn = this.getPreReqTurn();
    const expGain = 5 * (preReqTurn + 1);

    const nationGeneralCount = Object.values(snapshot.generals).filter(
      (g) => g.nationId === iNation.id
    ).length;

    const targetPostReqTurn = this.getTargetPostReqTurn(nationGeneralCount);

    // 쿨타임 업데이트 로직
    const actorAux = { ...iNation.aux };
    const actorNextExecute = { ...(actorAux.nextExecute || {}) };
    actorNextExecute["NationRetaliationCommand"] = yearMonth + this.getPostReqTurn();
    // actorNextExecute[commandType] = yearMonth + targetPostReqTurn; // 자국 해당 커맨드도 쿨타임? (레거시 확인)
    // 레거시: $nationStor->setValue($cmd->getNextExecuteKey(), $yearMonth + $this->getTargetPostReqTurn());
    actorNextExecute[commandType] = yearMonth + targetPostReqTurn;
    actorAux.nextExecute = actorNextExecute;

    const destAux = { ...iDestNation.aux };
    const destNextExecute = { ...(destAux.nextExecute || {}) };
    const currentDestDelay = Math.max(destNextExecute[commandType] || 0, yearMonth);
    destNextExecute[commandType] = currentDestDelay + NationRetaliationCommand.DELAY_COUNT;
    destAux.nextExecute = destNextExecute;

    return {
      generals: {
        [actorId]: {
          experience: iActor.experience + expGain,
          dedication: iActor.dedication + expGain,
          lastTurn: {
            action: this.actionName,
            destNationId,
            commandType,
            postReqTurn: this.getPostReqTurn(),
          },
        },
      },
      nations: {
        [iNation.id]: {
          strategicCmdLimit: 9, // 전략 커맨드 공통 쿨타임
          aux: actorAux,
        },
        [destNationId]: {
          aux: destAux,
        },
      },
      logs: {
        general: {
          [actorId]: [
            `【${iDestNation.name}】에 【${commandType}】 전략의 ${this.actionName} 발동!`,
          ],
        },
        nation: {
          [iNation.id]: [
            `${iActor.name}${josaYi} 【${iDestNation.name}】에 【${commandType}】 전략의 ${this.actionName} 발동`,
          ],
          [destNationId]: [
            `【${iNation.name}】의 ${iActor.name}${josaYi} 아국에 【${commandType}】 전략의 ${this.actionName} 발동`,
          ],
        },
        global: [
          `${iActor.name}${josaYi} 【${iDestNation.name}】에 【${commandType}】 전략의 ${this.actionName}을 발동하였습니다.`,
        ],
      },
    };
  }
}
