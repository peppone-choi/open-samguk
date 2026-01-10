import { WorldSnapshot } from "./entities.js";

/**
 * 시드 생성에 필요한 컨텍스트 정보
 */
export interface SeedContext {
  /** 서버 전역 고유 시드 문자열 */
  hiddenSeed: string;
  /** 게임 내 연도 */
  year: number;
  /** 게임 내 월 */
  month: number;
  /** 행동을 수행하는 장수의 고유 ID */
  actorId: number;
  /** 수행할 행동(커맨드)의 고유 이름 */
  actionName: string;
}

/**
 * 결정론적 RNG(난수 생성기)를 위한 시드 생성기
 * 동일한 상황(연월, 장수, 행동)에서 항상 똑같은 난수 시퀀스가 나오도록 보장합니다.
 * 레거시 삼국지 규칙(hiddenSeed + year + month + generalId + commandName)을 따릅니다.
 */
export class SeedGenerator {
  /**
   * 주어진 컨텍스트 정보를 조합하여 고유 시드 문자열을 생성합니다.
   */
  public static generate(ctx: SeedContext): string {
    return `${ctx.hiddenSeed}:${ctx.year}:${ctx.month}:${ctx.actorId}:${ctx.actionName}`;
  }

  /**
   * 월드 스냅샷(Snapshot)으로부터 현재 시점의 결정론적 시드를 생성합니다.
   *
   * @param snapshot 현재 게임 상태
   * @param actorId 행동 장수 ID
   * @param actionName 행동 이름
   * @param hiddenSeed 서버 보안 시드 (선택 사항)
   * @returns 생성된 시드 문자열
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
