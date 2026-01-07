import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { GeneralHelper } from "../../utils/GeneralHelper.js";

/**
 * NPC 등록 이벤트
 * 레거시: RegNPC.php, RegNeutralNPC.php
 */
export interface RegNPCArgs {
  affinity: number;
  name: string;
  picturePath: string;
  nationId: number;
  locatedCityId: number;
  leadership: number;
  strength: number;
  intel: number;
  officerLevel: number;
  birth?: number;
  death?: number;
  npcType?: number;
}

export class RegNPCEvent implements GameEvent {
  public id = "reg_npc_event";
  public name = "NPC 등록";
  public target = EventTarget.MONTH;
  public priority = 45;

  constructor(private args: RegNPCArgs) {}

  condition(): boolean {
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      generals: {},
    };

    const nextId = Math.max(0, ...Object.keys(snapshot.generals).map(Number)) + 1;

    const newGen = {
      ...GeneralHelper.createEmptyGeneral(nextId, this.args.name),
      ownerId: 0,
      nationId: this.args.nationId,
      cityId: this.args.locatedCityId,
      npc: this.args.npcType ?? 1,
      leadership: this.args.leadership,
      strength: this.args.strength,
      intel: this.args.intel,
      officerLevel: this.args.officerLevel,
      bornYear: this.args.birth ?? 160,
      deadYear: this.args.death ?? 300,
      picture: this.args.picturePath,
    };

    delta.generals![nextId] = newGen;

    return delta;
  }
}
