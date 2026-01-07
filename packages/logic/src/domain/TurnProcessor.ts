import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, WorldDelta, ReservedTurn } from "./entities.js";
import { CommandHelper } from "./CommandHelper.js";
import { NPCAutomation } from "./NPCAutomation.js";

const NPC_TYPE_GENERAL = 2;

export class TurnProcessor {
  private npcAutomation: NPCAutomation;

  constructor(private readonly seed: string) {
    this.npcAutomation = new NPCAutomation();
  }

  processGeneralTurn(snapshot: WorldSnapshot, generalId: number): WorldDelta {
    const general = snapshot.generals[generalId];
    if (!general) throw new Error(`General ${generalId} not found`);

    const rng = new LiteHashDRBG(
      `${this.seed}:${generalId}:${snapshot.gameTime.year}:${snapshot.gameTime.month}`
    );
    const rand = new RandUtil(rng);

    let turnInfo: ReservedTurn | undefined = snapshot.generalTurns[generalId]?.[0];

    if (!turnInfo && general.npc >= NPC_TYPE_GENERAL) {
      const npcTurns = this.npcAutomation.assignNPCTurns(rand, snapshot, generalId);
      if (npcTurns && npcTurns.length > 0) {
        turnInfo = npcTurns[0];
      }
    }

    if (turnInfo) {
      const command = CommandHelper.getCommand(turnInfo.action);
      if (command) {
        const check = command.checkConstraints(rand, snapshot, generalId, turnInfo.arg);
        if (check.kind === "allow") {
          const delta = command.run(rand, snapshot, generalId, turnInfo.arg);
          if (!delta.deleteGeneralTurns) delta.deleteGeneralTurns = [];
          delta.deleteGeneralTurns.push({ generalId, turnIdx: turnInfo.turnIdx });
          return delta;
        }
      }
    }

    const goldGain = rand.nextRangeInt(10, 50);
    const riceGain = rand.nextRangeInt(10, 50);

    return {
      generals: {
        [generalId]: {
          gold: general.gold + goldGain,
          rice: general.rice + riceGain,
        },
      },
    };
  }
}
