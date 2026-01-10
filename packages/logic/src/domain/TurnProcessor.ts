import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, WorldDelta, ReservedTurn } from "./entities.js";
import { CommandHelper } from "./CommandHelper.js";
import { NPCAutomation } from "./NPCAutomation.js";

const NPC_TYPE_GENERAL = 2;

/**
 * 턴 프로세서
 * 개별 장수의 턴을 실행하고 결과(델타)를 계산합니다.
 */
export class TurnProcessor {
  private npcAutomation: NPCAutomation;

  /**
   * @param seed 게임 엔진의 공통 시드 (결정론적 난수 생성용)
   */
  constructor(private readonly seed: string) {
    this.npcAutomation = new NPCAutomation();
  }

  /**
   * 장수의 한 턴을 처리합니다.
   * 
   * @param snapshot 현재 월드 스냅샷
   * @param generalId 턴을 실행할 장수 ID
   * @returns 턴 실행 결과가 담긴 상태 변경 델타
   */
  processGeneralTurn(snapshot: WorldSnapshot, generalId: number): WorldDelta {
    const general = snapshot.generals[generalId];
    if (!general) throw new Error(`장수 ${generalId}를 찾을 수 없습니다.`);

    const delta: WorldDelta = {
      generals: {},
      logs: { general: {} },
    };

    // 장수별, 연월별 고유 시드로 난수 생성기 초기화 (결정론적 결과 보장)
    const rng = new LiteHashDRBG(
      `${this.seed}:${generalId}:${snapshot.gameTime.year}:${snapshot.gameTime.month}`
    );
    const rand = new RandUtil(rng);

    // 1. 블록 처리 (비매너 또는 멀티 유저 차단 로직)
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

    // 2. 프리턴 트리거 (예상 로직: 부상 회복, 병사 소모 등)
    // TODO: 트리거 시스템 연동 (SoldierMaintenance, InjuryReduction 등)

    // 예약된 턴 정보 획득
    let turnInfo: ReservedTurn | undefined = snapshot.generalTurns[generalId]?.[0];

    // NPC인 경우 예약된 턴이 없으면 자동으로 할당
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
        // 제약 조건 검사
        const check = command.checkConstraints(rand, snapshot, generalId, turnInfo.arg);
        if (check.kind === "allow") {
          // 커맨드 실행
          const commandDelta = command.run(rand, snapshot, generalId, turnInfo.arg);

          // 결과 델타 병합
          Object.assign(delta.generals!, commandDelta.generals || {});
          Object.assign(delta.logs!.general!, commandDelta.logs?.general || {});
          delta.cities = commandDelta.cities;
          delta.nations = commandDelta.nations;

          // 사용한 예약 턴 삭제 예약
          if (!delta.deleteGeneralTurns) delta.deleteGeneralTurns = [];
          delta.deleteGeneralTurns.push({ generalId, turnIdx: turnInfo.turnIdx });
        }
      }
    }

    // 3. 삭턴 처리 (미접속 시 자동 삭제 방지 및 유지 로직)
    const currentKillTurn = general.killTurn;
    const gameKillTurnLimit = snapshot.env["killturn"] || 20;

    let newKillTurn = currentKillTurn;
    // NPC거나 리미트 초과 상태, 혹은 명시적 휴식 시 삭턴 카운트 감소
    if (general.npc >= 2 || currentKillTurn > gameKillTurnLimit || executedCommandName === "휴식") {
      newKillTurn = Math.max(0, currentKillTurn - 1);
    } else {
      // 그 외 활동 시 삭턴 리미트 초기화
      newKillTurn = gameKillTurnLimit;
    }

    if (!delta.generals![generalId]) delta.generals![generalId] = {};
    delta.generals![generalId].killTurn = newKillTurn;

    // 만약 로그나 변화가 전혀 없는 경우 기본 수입 처리 (Fallback)
    if (Object.keys(delta.generals![generalId]).length === 1 && !turnInfo) {
      const goldGain = rand.nextRangeInt(10, 50);
      const riceGain = rand.nextRangeInt(10, 50);
      delta.generals![generalId].gold = general.gold + goldGain;
      delta.generals![generalId].rice = general.rice + riceGain;
    }

    return delta;
  }
}

