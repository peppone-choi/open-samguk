import { WorldSnapshot } from "./entities.js";

/**
 * 시드 생성 컨텍스트
 */
export interface SeedContext {
  hiddenSeed: string;
  year: number;
  month: number;
  actorId: number;
  actionName: string;
}

/**
 * 결정론적 RNG 시드 생성기
 * 레거시 규칙: hiddenSeed + year + month + generalId + commandName
 */
export class SeedGenerator {
  public static generate(ctx: SeedContext): string {
    return `${ctx.hiddenSeed}:${ctx.year}:${ctx.month}:${ctx.actorId}:${ctx.actionName}`;
  }

  /**
   * 월드 스냅샷으로부터 컨텍스트 기반 시드 생성
   */
  public static fromSnapshot(
    snapshot: WorldSnapshot,
    actorId: number,
    actionName: string,
    hiddenSeed: string = "default-hidden-seed"
  ): string {
    return this.generate({
      hiddenSeed,
      year: snapshot.gameTime.year,
      month: snapshot.gameTime.month,
      actorId,
      actionName,
    });
  }
}
