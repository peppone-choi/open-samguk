/**
 * @fileoverview 인메모리 월드 상태 저장소
 *
 * WorldState는 게임의 단일 권위 상태(Source of Truth)를 관리합니다.
 * 엔진이 이 상태를 메모리에 유지하며 실시간 행동을 처리하고, DB는 상태 백업 및 로그 기록 용도로 사용됩니다.
 *
 * 상태 변경 흐름:
 * 1. 커맨드/이벤트 실행 → WorldDelta(변경분) 생성
 * 2. WorldState.applyDelta(delta) 호출 → 내부 스냅샷 업데이트
 * 3. 업데이트된 스냅샷을 DB나 클라이언트에 전파
 */

import { WorldSnapshot, WorldDelta } from "./entities.js";

/**
 * 인메모리 월드 상태 클래스
 * 모든 게임 엔티티(장수, 세력, 도시 등)의 최신 상태를 관리하는 컨테이너입니다.
 */
export class WorldState {
  /** 실제 데이터가 담긴 읽기/쓰기 가능 상태 객체 */
  private state: WorldSnapshot;

  /**
   * @param initialState 데이터 로드 시점의 초기 월드 상태
   */
  constructor(initialState: WorldSnapshot) {
    this.state = { ...initialState };
  }

  /**
   * 스냅샷으로부터 현재 상태를 복구하거나 초기화합니다.
   * 외부 스냅샷과의 참조를 끊기 위해 깊은 복사(JSON 기반)를 수행합니다.
   * 
   * @param snapshot 복구할 게임 상태 스냅샷
   */
  public restoreFromSnapshot(snapshot: WorldSnapshot): void {
    this.state = JSON.parse(JSON.stringify(snapshot));
  }

  /**
   * 현재 시점의 월드 상태 스냅샷을 획득합니다.
   * 외부 조작으로부터 내부 상태를 보호하기 위해 깊은 복사본을 반환합니다.
   */
  public getSnapshot(): WorldSnapshot {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * 델타(Delta)를 현재 상태에 반영합니다.
   * 변경된 엔티티만 부분적으로 업데이트하며, 새로운 메시지 생성이나 삭제 기능도 지원합니다.
   *
   * @param delta 적용할 상태 변경 정보
   */
  public applyDelta(delta: WorldDelta): void {
    // 1. 장수 정보 업데이트
    if (delta.generals) {
      for (const [id, gDelta] of Object.entries(delta.generals)) {
        const nid = Number(id);
        const current = this.state.generals[nid];
        if (current) {
          this.state.generals[nid] = { ...current, ...gDelta } as any;
        }
      }
    }

    // 2. 국가 정보 업데이트
    if (delta.nations) {
      for (const [id, nDelta] of Object.entries(delta.nations)) {
        const nid = Number(id);
        const current = this.state.nations[nid];
        if (current) {
          this.state.nations[nid] = { ...current, ...nDelta } as any;
        }
      }
    }

    // 3. 도시 정보 업데이트
    if (delta.cities) {
      for (const [id, cDelta] of Object.entries(delta.cities)) {
        const nid = Number(id);
        const current = this.state.cities[nid];
        if (current) {
          this.state.cities[nid] = { ...current, ...cDelta } as any;
        }
      }
    }

    // 4. 외교 관계 업데이트 (없으면 신규 생성)
    if (delta.diplomacy) {
      for (const [key, dDelta] of Object.entries(delta.diplomacy)) {
        const current = this.state.diplomacy[key];
        if (current) {
          this.state.diplomacy[key] = { ...current, ...dDelta } as any;
        } else if ((dDelta as any).srcNationId) {
          this.state.diplomacy[key] = dDelta as any;
        }
      }
    }

    // 5. 부대 정보 업데이트
    if (delta.troops) {
      for (const [id, tDelta] of Object.entries(delta.troops)) {
        const nid = Number(id);
        const current = this.state.troops[nid];
        if (current) {
          this.state.troops[nid] = { ...current, ...tDelta } as any;
        } else if ((tDelta as any).nationId) {
          this.state.troops[nid] = tDelta as any;
        }
      }
    }

    // 6. 신규 메시지 추가
    if (delta.messages) {
      for (const message of delta.messages) {
        this.state.messages[message.id] = message;
      }
    }

    // 7. 게임 시간 업데이트
    if (delta.gameTime) {
      this.state.gameTime = { ...this.state.gameTime, ...delta.gameTime };
    }
  }

  /**
   * 저장된 저널(Journal) 로그를 재생하여 상태를 순차적으로 복원합니다.
   * 이벤트 소싱 패턴을 지원하며 추후 동기화 로직에 기여합니다.
   *
   * @param journal 실행 상세를 담은 저널 엔트리
   */
  public applyJournal(journal: { type: string; payload: any }): void {
    if (journal.type === "turn_run" && journal.payload.delta) {
      this.applyDelta(journal.payload.delta);
    }
    // TODO: 월간 이벤트 전환 등에 의한 저널 플레이 지원 확장
  }
}
