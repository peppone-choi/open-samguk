import { JosaUtil, RandUtil, LiteHashDRBG } from "@sammo/common";
import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta, Troop } from "../../entities.js";
import { GeneralHelper } from "../../utils/GeneralHelper.js";

/**
 * NPC 부대장 지원 이벤트
 * 레거시: ProvideNPCTroopLeader.php
 */
export class ProvideNPCTroopLeaderEvent implements GameEvent {
  public id = "provide_npc_troop_leader_event";
  public name = "NPC 부대장 지원";
  public target = EventTarget.MONTH;
  public priority = 100;

  private static MaxNPCTroopLeaderCnt: Record<number, number> = {
    1: 0,
    2: 1,
    3: 3,
    4: 4,
    5: 6,
    6: 7,
    7: 9,
  };

  condition(): boolean {
    return true; // 매월 실행
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { year, month } = snapshot.gameTime;
    const delta: WorldDelta = {
      generals: {},
      troops: {},
      env: {},
    };

    const dGenerals = delta.generals!;
    const dTroops = delta.troops!;
    const dEnv = delta.env!;

    const nations = Object.values(snapshot.nations);
    const generals = Object.values(snapshot.generals);

    let lastNPCTroopLeaderID = snapshot.env.lastNPCTroopLeaderID ?? 0;
    let currentNextGeneralId = Math.max(0, ...Object.keys(snapshot.generals).map(Number)) + 1;

    for (const nation of nations) {
      if (nation.id === 0) continue;

      const maxLeaders = ProvideNPCTroopLeaderEvent.MaxNPCTroopLeaderCnt[nation.level] ?? 0;
      const currentLeaders = generals.filter((g) => g.nationId === nation.id && g.npc === 5).length;

      if (currentLeaders >= maxLeaders) continue;

      const rng = new RandUtil(
        new LiteHashDRBG(`ProvideNPCTroopLeader:${year}:${month}:${nation.id}`)
      );

      let needed = maxLeaders - currentLeaders;
      for (let i = 0; i < needed; i++) {
        lastNPCTroopLeaderID++;
        const npcId = currentNextGeneralId++;
        const npcName = `부대장${lastNPCTroopLeaderID.toString().padStart(4, "0")}`;

        const newGeneral = {
          ...GeneralHelper.createEmptyGeneral(npcId, npcName),
          nationId: nation.id,
          cityId: nation.capitalCityId, // 수도에서 생성
          npc: 5,
          leadership: 10,
          strength: 10,
          intel: 10,
          politics: 10,
          charm: 10,
          officerLevel: 1,
          troopId: npcId, // 자기 자신이 리더인 부대
          special: "None",
          special2: "None",
          experience: 0,
          dedication: 0,
        };

        const newTroop: Troop = {
          id: npcId,
          nationId: nation.id,
          name: npcName,
          meta: {},
        };

        dGenerals[npcId] = newGeneral;
        dTroops[npcId] = newTroop;
      }
    }

    dEnv.lastNPCTroopLeaderID = lastNPCTroopLeaderID;

    return delta;
  }
}
