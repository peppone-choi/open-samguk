import { LiteHashDRBG, RandUtil } from "@sammo/common";
import { WorldSnapshot, WorldDelta } from "./entities.js";
import { CommandHelper } from "./CommandHelper.js";

export class TurnProcessor {
  constructor(private readonly seed: string) {}

  processGeneralTurn(snapshot: WorldSnapshot, generalId: number): WorldDelta {
    const general = snapshot.generals[generalId];
    if (!general) throw new Error(`General ${generalId} not found`);

    const turnInfo = snapshot.generalTurns[generalId]?.[0];

    const rng = new LiteHashDRBG(
      `${this.seed}:${generalId}:${snapshot.gameTime.year}:${snapshot.gameTime.month}`
    );
    const rand = new RandUtil(rng);

    if (turnInfo) {
      const command = CommandHelper.getCommand(turnInfo.action);
      if (command) {
        // 제약 조건 확인 (생략 가능 - EngineService에서 이미 확인했을 수도 있음)
        const check = command.checkConstraints(rand, snapshot, generalId, turnInfo.arg);
        if (check.kind === "allow") {
          const delta = command.run(rand, snapshot, generalId, turnInfo.arg);
          // 실행된 턴 삭제 델타 추가
          if (!delta.deleteGeneralTurns) delta.deleteGeneralTurns = [];
          delta.deleteGeneralTurns.push({ generalId, turnIdx: turnInfo.turnIdx });
          return delta;
        }
      }
    }

    // 기본 휴식 로직 (명령이 없거나 실행 불가인 경우)
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
