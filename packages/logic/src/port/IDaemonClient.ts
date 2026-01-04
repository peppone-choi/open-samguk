/**
 * 데몬 제어 클라이언트 인터페이스 (Port)
 * DDD: API 서버가 엔진(데몬)에 명령을 전달할 때 사용함
 */
export interface IDaemonClient {
  /**
   * 명령을 대기열에 추가
   */
  sendCommand(params: {
    type: string;
    requestId: string;
    payload: any;
  }): Promise<void>;
}
