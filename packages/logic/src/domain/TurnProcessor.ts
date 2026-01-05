import { LiteHashDRBG, RandUtil } from "@sammo-ts/common";
import { WorldSnapshot, WorldDelta } from "./entities.js";

export class TurnProcessor {
  constructor(private readonly seed: string) {}

  processGeneralTurn(snapshot: WorldSnapshot, generalId: number): WorldDelta {
    const general = snapshot.generals[generalId];
    if (!general) throw new Error(`General ${generalId} not found`);

    const rng = new LiteHashDRBG(
      `${this.seed}:${generalId}:${snapshot.gameTime.year}:${snapshot.gameTime.month}`,
    );
    const rand = new RandUtil(rng);

    // 단순한 휴식 로직 (금/군량 소폭 증가)
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
