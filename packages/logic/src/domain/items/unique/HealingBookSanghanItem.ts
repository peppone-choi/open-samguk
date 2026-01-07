/**
 * 상한잡병론(의술) - che_의술_상한잡병론.php 포팅
 * [군사] 매 턴마다 자신(100%) 부상 회복
 */
import { BaseItem } from "../BaseItem.js";

export class HealingBookSanghanItem extends BaseItem {
  readonly code = "che_의술_상한잡병론";
  readonly rawName = "상한잡병론";
  readonly name = "상한잡병론(의술)";
  readonly info = "[군사] 매 턴마다 자신(100%) 부상 회복";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;
}
