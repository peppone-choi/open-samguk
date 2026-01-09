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

    const delta: WorldDelta = {
      generals: {},
      logs: { general: {} },
    };

    const rng = new LiteHashDRBG(
      `${this.seed}:${generalId}:${snapshot.gameTime.year}:${snapshot.gameTime.month}`
    );
    const rand = new RandUtil(rng);

    // 1. 블럭 처리 (Legacy: processBlocked)
    if (general.block >= 2) {
      const dateStr = general.turnTime.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const reason = general.block === 2 ? "멀티 또는 비매너" : "악성 유저";

      delta.generals![generalId] = {
        killTurn: Math.max(0, general.killTurn - 1),
      };
      delta.logs!.general![generalId] = [
        `현재 ${reason}로 인한 <R>블럭</> 대상자입니다. <1>${dateStr}</>`,
      ];
      return delta;
    }

    // 2. 프리턴 트리거 (Legacy: preprocessCommand)
    // TODO: 트리거 시스템 연동 (SoldierMaintenance, InjuryReduction 등)

    let turnInfo: ReservedTurn | undefined = snapshot.generalTurns[generalId]?.[0];

    // NPC 자동 턴 할당
    if (!turnInfo && general.npc >= NPC_TYPE_GENERAL) {
      const npcTurns = this.npcAutomation.assignNPCTurns(rand, snapshot, generalId);
      if (npcTurns && npcTurns.length > 0) {
        turnInfo = npcTurns[0];
      }
    }

    let executedCommandName = "휴식";

    if (turnInfo) {
      const command = CommandHelper.getCommand(turnInfo.action);
      if (command) {
        executedCommandName = turnInfo.action;
        const check = command.checkConstraints(rand, snapshot, generalId, turnInfo.arg);
        if (check.kind === "allow") {
          const commandDelta = command.run(rand, snapshot, generalId, turnInfo.arg);
          // Delta 병합
          Object.assign(delta.generals!, commandDelta.generals || {});
          Object.assign(delta.logs!.general!, commandDelta.logs?.general || {});
          delta.cities = commandDelta.cities;
          delta.nations = commandDelta.nations;

          if (!delta.deleteGeneralTurns) delta.deleteGeneralTurns = [];
          delta.deleteGeneralTurns.push({ generalId, turnIdx: turnInfo.turnIdx });
        }
      }
    }

    // 3. 삭턴 처리 (Legacy: killturn logic)
    const currentKillTurn = general.killTurn;
    const gameKillTurnLimit = snapshot.env["killturn"] || 20;

    let newKillTurn = currentKillTurn;
    if (general.npc >= 2 || currentKillTurn > gameKillTurnLimit || executedCommandName === "휴식") {
      newKillTurn = Math.max(0, currentKillTurn - 1);
    } else {
      newKillTurn = gameKillTurnLimit;
    }

    if (!delta.generals![generalId]) delta.generals![generalId] = {};
    delta.generals![generalId].killTurn = newKillTurn;

    // 만약 로그나 변화가 전혀 없는 경우 기본 수입 (Fallback)
    if (Object.keys(delta.generals![generalId]).length === 1 && !turnInfo) {
      const goldGain = rand.nextRangeInt(10, 50);
      const riceGain = rand.nextRangeInt(10, 50);
      delta.generals![generalId].gold = general.gold + goldGain;
      delta.generals![generalId].rice = general.rice + riceGain;
    }

    return delta;
  }
}
