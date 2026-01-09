import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta, Nation } from "../../entities.js";

/**
 * 천하통일 검사 및 게임 종료 이벤트
 * 레거시: 통일 조건 검사 및 게임 종료 처리
 *
 * 통일 조건:
 * 1. 플레이어 국가가 1개만 남음
 * 2. 이민족/황건적 제외 조건 체크
 */
export class UnificationCheckEvent implements GameEvent {
  public id = "unification_check_event";
  public name = "천하통일 검사";
  public target = EventTarget.MONTH;
  public priority = 5; // 높은 우선순위 - 다른 월별 이벤트 전에 실행

  condition(snapshot: WorldSnapshot): boolean {
    // 이미 통일된 경우 스킵
    if (snapshot.env?.isUnited) {
      return false;
    }

    // 활성 국가 수 계산 (이민족/중립 제외)
    const activeNations = this.getActiveNations(snapshot);

    // 1개 이하의 국가만 남으면 통일
    return activeNations.length <= 1;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const activeNations = this.getActiveNations(snapshot);
    const winnerNation = activeNations[0] ?? null;

    if (!winnerNation) {
      // 모든 국가 멸망 - 게임 오버
      return {
        env: {
          isUnited: true,
          unificationDate: {
            year: snapshot.gameTime.year,
            month: snapshot.gameTime.month,
          },
          unifiedBy: null,
        },
        logs: {
          global: ["<R><b>【게임 종료】</b></>모든 국가가 멸망하였습니다."],
        },
      };
    }

    // 천하통일
    return {
      env: {
        isUnited: true,
        unificationDate: {
          year: snapshot.gameTime.year,
          month: snapshot.gameTime.month,
        },
        unifiedBy: winnerNation.id,
      },
      logs: {
        global: [
          `<Y><b>【천하통일】</b></>${winnerNation.name}이(가) 천하를 통일하였습니다!`,
          `${snapshot.gameTime.year}년 ${snapshot.gameTime.month}월, 새 왕조가 시작됩니다.`,
        ],
      },
    };
  }

  /**
   * 활성 국가 목록 반환 (이민족/중립 제외)
   */
  private getActiveNations(snapshot: WorldSnapshot): Nation[] {
    return Object.values(snapshot.nations).filter((nation) => {
      // 중립/무소속 국가 제외 (nationId = 0)
      if (nation.id === 0) {
        return false;
      }

      // 이민족 제외 (레거시: nation.type이 이민족 타입인 경우)
      // aux에 isInvader가 있으면 이민족으로 취급
      if (nation.aux?.isInvader) {
        return false;
      }

      // 황건적 제외 (레거시: 특정 type 체크)
      // aux에 isYellowTurbans가 있으면 황건적으로 취급
      if (nation.aux?.isYellowTurbans) {
        return false;
      }

      return true;
    });
  }
}

/**
 * 통일 후속 처리 이벤트
 * 통일 이후 유산 포인트 정산, 랭킹 확정 등
 */
export class UnificationPostProcessEvent implements GameEvent {
  public id = "unification_post_process_event";
  public name = "통일 후속 처리";
  public target = EventTarget.UNITED;
  public priority = 10;

  condition(snapshot: WorldSnapshot): boolean {
    // UNITED 타겟으로 실행되므로 항상 true
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    // 유산 포인트 정산, 랭킹 확정 등은 서비스 레이어에서 처리
    // 여기서는 로그만 생성

    return {
      logs: {
        global: ["<G>【공지】</>게임이 종료되었습니다. 유산 포인트가 정산됩니다."],
      },
    };
  }
}

/**
 * 게임 종료 시 랭킹 확정 이벤트
 */
export class FinalizeRankingEvent implements GameEvent {
  public id = "finalize_ranking_event";
  public name = "랭킹 확정";
  public target = EventTarget.UNITED;
  public priority = 20;

  condition(snapshot: WorldSnapshot): boolean {
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    // 랭킹 데이터 확정 처리
    // 실제 DB 저장은 서비스 레이어에서 처리
    return {
      env: {
        rankingFinalized: true,
        rankingFinalizedDate: new Date().toISOString(),
      },
      logs: {
        global: ["<G>【공지】</>최종 랭킹이 확정되었습니다."],
      },
    };
  }
}
