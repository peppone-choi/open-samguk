/**
 * 저널 레포지토리 인터페이스 (Port)
 * DDD: 도메인/로직 레이어는 이 인터페이스에만 의존하며, 실제 DB 구현은 알지 못함
 */
export interface IJournalRepository {
  /**
   * 변경 사항을 저널로 기록
   */
  record(params: {
    profile: string;
    type: string;
    payload: any;
    seq: string;
  }): Promise<void>;
}
