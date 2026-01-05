/**
 * 예약된 턴 정보를 관리하는 레포지토리 (Port)
 */
export interface ITurnRepository {
  /**
   * 특정 장수의 가장 빠른 예약된 턴을 가져옴
   */
  getNextTurn(generalId: number): Promise<{ action: string; arg: any } | null>;

  /**
   * 실행 완료된 턴 제거 (혹은 상태 변경)
   */
  consumeTurn(generalId: number): Promise<void>;

  /**
   * 특정 국가의 예약된 턴을 가져옴
   */
  getNextNationTurn(
    nationId: number,
    officerLevel: number,
  ): Promise<{ action: string; arg: any } | null>;

  /**
   * 실행 완료된 국가 턴 제거
   */
  consumeNationTurn(nationId: number, officerLevel: number): Promise<void>;
}
