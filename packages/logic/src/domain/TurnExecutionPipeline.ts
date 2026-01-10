import { WorldSnapshot } from "./entities.js";

/**
 * 턴 실행 파이프라인
 * 핵심 게임 루프의 오케스트레이션을 담당합니다.
 * 어떤 장수가 턴을 실행해야 하는지, 월간 전환이 필요한지 판단합니다.
 */
export class TurnExecutionPipeline {
  /**
   * 지정된 시점(targetTime)까지 턴을 실행해야 하는 장수 목록을 추출하고 정렬합니다.
   * 
   * @param snapshot 월드 상태 스냅샷
   * @param targetTime 기준 시간 (보통 서버 현재 시간)
   * @returns 실행 대상 장수 ID 배열 (시간 순 정렬)
   */
  public findExecutableGenerals(snapshot: WorldSnapshot, targetTime: Date): number[] {
    return Object.values(snapshot.generals)
      .filter((g) => g.turnTime <= targetTime)
      .sort((a, b) => a.turnTime.getTime() - b.turnTime.getTime())
      .map((g) => g.id);
  }

  /**
   * 월간 전환(연월 변경)이 필요한 상태인지 확인합니다.
   * 모든 실행 가능한 장수의 처리가 완료되고, 다음 월로 넘어갈 시간이 되었을 때 true를 반환합니다.
   * 
   * @param snapshot 월드 상태 스냅샷
   * @param targetTime 기준 시간
   * @returns 월간 전환 필요 여부
   */
  public shouldAdvanceMonth(snapshot: WorldSnapshot, targetTime: Date): boolean {
    // 1. 실행 가능한 장수가 남아있다면 아직 월을 넘기면 안 됨
    const executableIds = this.findExecutableGenerals(snapshot, targetTime);
    if (executableIds.length > 0) {
      return false;
    }

    // 2. 서버의 전역 턴 시간(env.turntime)을 기준으로 월 전환 여부를 판단
    const lastTurnTime = snapshot.env["turntime"];
    const turnTerm = snapshot.env["turnterm"] || 10; // 턴 간격 (분 단위)

    if (lastTurnTime) {
      const lastTurnDate = new Date(lastTurnTime);
      // 마지막 턴 종료 후 정해진 간격(turnterm)이 지나야 다음 달로 전환 가능
      const nextMonthTime = new Date(lastTurnDate.getTime() + turnTerm * 60 * 1000);

      if (targetTime < nextMonthTime) {
        return false;
      }
    }

    return true;
  }
}
