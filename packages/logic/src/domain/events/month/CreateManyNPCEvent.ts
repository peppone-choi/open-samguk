import { RandUtil, LiteHashDRBG } from "@sammo/common";
import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { GeneralHelper } from "../../utils/GeneralHelper.js";

/**
 * 인등장 (장수 대량 생성) 이벤트
 * 레거시: CreateManyNPC.php
 */
export class CreateManyNPCEvent implements GameEvent {
  public id = "create_many_npc_event";
  public name = "장수 대량 생성";
  public target = EventTarget.MONTH;
  public priority = 40;

  constructor(
    public count: number = 10,
    public fillCnt: number = 0
  ) {}

  condition(): boolean {
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { year, month } = snapshot.gameTime;
    const rng = new RandUtil(new LiteHashDRBG(`CreateManyNPC:${year}:${month}`));

    const delta: WorldDelta = {
      generals: {},
      logs: { global: [] },
    };

    const dGenerals = delta.generals!;
    let currentNextGeneralId = Math.max(0, ...Object.keys(snapshot.generals).map(Number)) + 1;

    // 대략적인 이름 풀 (실제로는 더 방대해야 함)
    const namePool = [
      "가나",
      "다라",
      "마사",
      "아자",
      "차카",
      "타파",
      "하가",
      "나다",
      "라마",
      "사아",
    ];

    for (let i = 0; i < this.count; i++) {
      const gId = currentNextGeneralId++;
      const name = rng.choice(namePool) + (gId % 100);

      const newGen = {
        ...GeneralHelper.createEmptyGeneral(gId, name),
        npc: 3, // 일반 NPC
        leadership: rng.nextRangeInt(50, 80),
        strength: rng.nextRangeInt(50, 80),
        intel: rng.nextRangeInt(50, 80),
        politics: rng.nextRangeInt(50, 80),
        charm: rng.nextRangeInt(50, 80),
        bornYear: year - rng.nextRangeInt(20, 30),
        deadYear: year + rng.nextRangeInt(30, 60),
      };

      dGenerals[gId] = newGen;
    }

    delta.logs!.global!.push(`장수 <C>${this.count}</>명이 <S>등장</>하였습니다.`);

    return delta;
  }
}
