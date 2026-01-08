/**
 * 도기(보물) - che_보물_도기.php 포팅
 * [내정] 아이템 판매 시 금 1000, 쌀 1000 추가 획득
 */
import { BaseItem } from "../BaseItem.js";
import { General } from "../../entities.js";
import { RandUtil } from "@sammo/common";

export class PotteryItem extends BaseItem {
  readonly code = "che_보물_도기";
  readonly rawName = "도기";
  readonly name = "도기(보물)";
  readonly info = "[내정] 아이템 판매 시 금 1000, 쌀 1000 추가 획득";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = false;
  readonly buyable = true;
  readonly reqSecu = 10;

  onArbitraryAction(
    general: General,
    _rng: RandUtil,
    actionType: string,
    phase?: string,
    _aux?: unknown
  ): any {
    if (actionType === "sellItem" && phase === "after") {
      return {
        delta: {
          gold: (general.gold || 0) + 1000,
          rice: (general.rice || 0) + 1000,
        },
        logs: ["도기(보물)의 효과로 금 1000, 쌀 1000을 추가로 획득했습니다!"],
      };
    }
    return null;
  }
}
