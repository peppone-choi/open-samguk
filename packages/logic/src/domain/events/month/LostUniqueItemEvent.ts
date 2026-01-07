import { JosaUtil, RandUtil, LiteHashDRBG } from "@sammo/common";
import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { GameConst } from "../../GameConst.js";

/**
 * 유니크 아이템 망실 이벤트
 * 레거시: LostUniqueItem.php
 *
 * 매월 10% 확률로 장수들이 소유한 비매품(유니크) 아이템을 유실합니다.
 */
export class LostUniqueItemEvent implements GameEvent {
  public id = "lost_unique_item_event";
  public name = "유니크 아이템 망실";
  public target = EventTarget.MONTH;
  public priority = 80;

  constructor(private lostProb: number = 0.1) {}

  condition(snapshot: WorldSnapshot): boolean {
    // 매월 발생 가능
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { year, month } = snapshot.gameTime;
    const rng = new RandUtil(new LiteHashDRBG(`LostUniqueItem:${year}:${month}`));

    const delta: WorldDelta = {
      generals: {},
      logs: {
        general: {},
        global: [],
      },
    };

    const dGenerals = delta.generals!;
    const dLogs = delta.logs!;

    let totalLostCnt = 0;
    let maxLostByGenCnt = 0;
    let maxLostGenList: string[] = [];

    for (const general of Object.values(snapshot.generals)) {
      // NPC는 아이템을 잃지 않음 (레거시: npc <= 1)
      if (general.npc > 1) continue;

      let lostByGenCnt = 0;
      const itemTypes: (keyof typeof GameConst.items)[] = ["weapon", "horse", "book", "item"];

      for (const type of itemTypes) {
        const itemCode = (general as any)[type];
        if (!itemCode || itemCode === "None" || itemCode === "") continue;

        const itemInfo = (GameConst.items as any)[type]?.[itemCode];
        if (!itemInfo || itemInfo.isBuyable) continue;

        // 유니크 아이템인 경우 잃을 확률 체크
        if (rng.nextBool(this.lostProb)) {
          const itemName = itemInfo.name;
          const josaUl = JosaUtil.pick(itemName, "을");

          if (!dGenerals[general.id]) dGenerals[general.id] = {};
          (dGenerals[general.id] as any)[type] = "None";

          if (!dLogs.general![general.id]) dLogs.general![general.id] = [];
          dLogs.general![general.id]!.push(`<C>${itemName}</>${josaUl} 잃었습니다.`);

          lostByGenCnt++;
          totalLostCnt++;
        }
      }

      if (lostByGenCnt > 0) {
        if (maxLostByGenCnt < lostByGenCnt) {
          maxLostByGenCnt = lostByGenCnt;
          maxLostGenList = [general.name];
        } else if (maxLostByGenCnt === lostByGenCnt) {
          maxLostGenList.push(general.name);
        }
      }
    }

    if (totalLostCnt === 0) {
      dLogs.global!.push("<R><b>【망실】</b></>어떤 아이템도 잃지 않았습니다!");
    } else {
      let maxLostGenListStr = maxLostGenList.slice(0, 4).join(", ");
      if (maxLostGenList.length > 4) {
        maxLostGenListStr += ` 외 ${maxLostGenList.length - 4}명`;
      }
      const josaYi = JosaUtil.pick(maxLostGenListStr, "이");
      dLogs.global!.push(
        `<R><b>【망실】</b></>불운하게도 <Y>${maxLostGenListStr}</>${josaYi} 한 번에 유니크 <C>${maxLostByGenCnt}</>종을 잃었습니다! (총 <C>${totalLostCnt}</>개)`
      );
    }

    return delta;
  }
}
