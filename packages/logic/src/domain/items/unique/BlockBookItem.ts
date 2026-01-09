/**
 * 삼황내문(저지) - che_저지_삼황내문.php 포팅
 * [전투] 수비 시 첫 페이즈 저지, 50% 확률로 2 페이즈 저지
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { BlockAttemptTrigger, BlockActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

export class BlockBookItem extends BaseItem {
  readonly code = "che_저지_삼황내문";
  readonly rawName = "삼황내문";
  readonly name = "삼황내문(저지)";
  readonly info = "[전투] 수비 시 첫 페이즈 저지, 50% 확률로 2 페이즈 저지";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new BlockAttemptTrigger(unit, RaiseType.ITEM, (u) => {
        // 수비측만 발동
        if (u.isAttacker) return 0;

        const phase = u.phase;
        const blockCount = u.hasActivatedSkillOnLog("저지");

        if (phase === 0 && blockCount === 0) {
          return 1; // 첫 페이즈 저지 100%
        }
        if (phase === 1 && blockCount === 1) {
          return 0.5; // 2 페이즈 저지 50%
        }

        return 0;
      }),
      new BlockActivateTrigger(unit, RaiseType.ITEM)
    );
  }
}
