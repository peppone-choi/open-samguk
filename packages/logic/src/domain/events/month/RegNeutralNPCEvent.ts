import { General, WorldSnapshot, WorldDelta } from "../../entities.js";
import { GameEvent, EventTarget } from "../types.js";
import { LiteHashDRBG, RandUtil } from "@sammo/common";

/**
 * 중립 NPC 등록 이벤트
 * 레거시 RegNeutralNPC.php 포팅
 */
export class RegNeutralNPCEvent implements GameEvent {
  readonly id = "RegNeutralNPC";
  readonly name = "중립 장수 등장";
  readonly target = EventTarget.MONTH;
  readonly priority = 0;

  constructor(
    private affinity: number,
    private personName: string,
    private picturePath: string,
    private nationId: number,
    private locatedCityId: number,
    private leadership: number,
    private strength: number,
    private intel: number,
    private birth: number = 160,
    private death: number = 300,
    private ego: string | null = null,
    private speciality: string = "",
    private text: string = ""
  ) {}

  condition(_snapshot: WorldSnapshot, _context?: any): boolean {
    return true; // 기본적으로 무조건 실행 (스케줄링에 의해 제어됨)
  }

  action(snapshot: WorldSnapshot, _context?: any): WorldDelta {
    const rng = new LiteHashDRBG(
      `RegNeutralNPC:${this.personName}:${this.nationId}:${snapshot.gameTime.year}`
    );
    const rand = new RandUtil(rng);

    const newId = Math.max(0, ...Object.keys(snapshot.generals).map(Number)) + 1;

    const newGeneral: General = {
      id: newId,
      name: this.personName,
      ownerId: 0,
      affinity: this.affinity,
      nationId: this.nationId,
      cityId: this.locatedCityId,
      npc: 6, // Neutral NPC
      troopId: 0,
      gold: 1000,
      rice: 1000,
      leadership: this.leadership,
      leadershipExp: 0,
      strength: this.strength,
      strengthExp: 0,
      intel: this.intel,
      intelExp: 0,
      politics: Math.floor((this.leadership + this.intel) / 2),
      politicsExp: 0,
      charm: rand.nextRangeInt(50, 90),
      charmExp: 0,
      injury: 0,
      experience: 0,
      dedication: 0,
      officerLevel: 1,
      officerCity: 0,
      recentWar: 0,
      crew: 0,
      crewType: 0,
      train: 80,
      atmos: 80,
      dex: {},
      age: snapshot.gameTime.year - this.birth,
      startAge: snapshot.gameTime.year - this.birth,
      belong: 0,
      betray: 0,
      dedLevel: 0,
      expLevel: 0,
      bornYear: this.birth,
      deadYear: this.death,
      personal: this.ego || "보통",
      special: this.speciality,
      specAge: 0,
      special2: "",
      specAge2: 0,
      weapon: "",
      book: "",
      horse: "",
      item: "",
      turnTime: new Date(snapshot.env["turntime"] || Date.now()),
      recentWarTime: null,
      makeLimit: 0,
      killTurn: 20,
      killnum: 0,
      block: 0,
      defenceTrain: 80,
      tournamentState: 0,
      lastTurn: {},
      meta: { npcText: this.text },
      penalty: {},
      officerLock: 0,
    };

    return {
      generals: {
        [newId]: newGeneral,
      },
      logs: {
        global: [`재야 장수 ${this.personName}님이 등장했습니다.`],
      },
    };
  }
}
