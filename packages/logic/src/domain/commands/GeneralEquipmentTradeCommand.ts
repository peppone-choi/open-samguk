import { RandUtil } from "@sammo/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";
import { getItemRegistry } from "../items/ItemRegistry.js";

/**
 * 장비매매 커맨드
 * 레거시: che_장비매매
 */
export class GeneralEquipmentTradeCommand extends GeneralCommand {
  readonly actionName = "장비매매";

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta {
    const { itemType, itemCode } = args;
    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const general = new General(iGeneral);
    const npcType = 0; // NPC 타입 (임시: 유저 0)

    // 인자 유효성 검사
    if (!["weapon", "horse", "book", "item"].includes(itemType)) {
      return {
        logs: { general: { [actorId]: ["장비 타입이 올바르지 않습니다."] } },
      };
    }

    const isSelling = itemCode === "None";
    let targetItemCode = itemCode;

    if (isSelling) {
      targetItemCode = (iGeneral as any)[itemType];
      if (targetItemCode === "None" || !targetItemCode) {
        return {
          logs: { general: { [actorId]: ["판매할 장비가 없습니다."] } },
        };
      }
    }

    // 아이템 정보 조회
    const itemInfo = (GameConst.items as any)[itemType]?.[targetItemCode];
    if (!itemInfo) {
      return {
        logs: {
          general: { [actorId]: ["해당 장비 정보를 찾을 수 없습니다."] },
        },
      };
    }

    // 제약 조건 동적 설정
    const reqGold = isSelling ? 0 : itemInfo.cost;
    this.fullConditionConstraints = [
      ConstraintHelper.ReqCityTrader(npcType),
      ConstraintHelper.ReqGeneralGold(reqGold),
    ];

    if (!isSelling) {
      this.fullConditionConstraints.push(ConstraintHelper.ReqCitySecu(itemInfo.reqSecu));
      // 이미 소지 중인지 체크
      if ((iGeneral as any)[itemType] === targetItemCode) {
        this.fullConditionConstraints.push(
          ConstraintHelper.AlwaysFail("이미 소지하고 있는 장비입니다.")
        );
      }
    }

    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`장비매매 실패: ${check.reason}`],
          },
        },
      };
    }

    let generalDelta: any;
    const logs: string[] = [];

    if (isSelling) {
      const sellPrice = Math.floor(itemInfo.cost / 2);
      generalDelta = {
        ...general.addGold(sellPrice),
        ...general.equip(itemType as any, "None"),
        ...general.addExperience(10),
      };
      logs.push(`${itemInfo.name}을(를) ${sellPrice}금에 판매했습니다.`);

      // 아이템/특기 후처리 (onArbitraryAction)
      const itemReg = getItemRegistry();
      const equippedItems = [iGeneral.weapon, iGeneral.horse, iGeneral.book, iGeneral.item];
      for (const code of equippedItems) {
        if (!code || code === "None") continue;
        const itemObj = itemReg.create(code);
        if (itemObj?.onArbitraryAction) {
          const actionResult = itemObj.onArbitraryAction(iGeneral, rng, "sellItem", "after", {
            itemType,
            itemCode: targetItemCode,
          });
          if (actionResult) {
            if (actionResult.delta) {
              // delta가 있으면 general 객체에 직접 반영하고 delta에 병합
              if (actionResult.delta.gold) {
                const goldDelta = actionResult.delta.gold - iGeneral.gold;
                generalDelta = { ...generalDelta, ...general.addGold(goldDelta) };
              }
              if (actionResult.delta.rice) {
                const riceDelta = actionResult.delta.rice - iGeneral.rice;
                generalDelta = { ...generalDelta, ...general.addRice(riceDelta) };
              }
              // 기타 필드 필요시 추가...
            }
            if (actionResult.logs) {
              logs.push(...actionResult.logs);
            }
          }
        }
      }

      // 진귀한 아이템 판매 시 전역 로그 (isBuyable이 false인 경우)
      if (!itemInfo.isBuyable) {
        return {
          generals: { [actorId]: generalDelta },
          logs: {
            general: { [actorId]: logs },
            global: [`${iGeneral.name}님이 진귀한 보물인 ${itemInfo.name}을(를) 판매했습니다!`],
          },
        };
      }
    } else {
      generalDelta = {
        ...general.addGold(-itemInfo.cost),
        ...general.equip(itemType as any, itemCode),
        ...general.addExperience(10),
      };
      logs.push(`${itemInfo.name}을(를) ${itemInfo.cost}금에 구입했습니다.`);
    }

    return {
      generals: {
        [actorId]: generalDelta,
      },
      logs: {
        general: {
          [actorId]: logs,
        },
      },
    };
  }
}
