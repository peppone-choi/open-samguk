/**
 * @fileoverview 인메모리 월드 상태 관리
 *
 * WorldState는 게임의 단일 권위 상태(Source of Truth)를 관리합니다.
 * 엔진이 이 상태를 소유하며, DB는 저널/스냅샷 역할만 합니다.
 *
 * 상태 변경 흐름:
 * 1. 커맨드 실행 → WorldDelta 반환
 * 2. WorldState.applyDelta(delta) 호출
 * 3. 스냅샷이 내부적으로 업데이트됨
 *
 * ⚠️ 중요: 외부에서 스냅샷을 직접 수정하면 안 됩니다!
 * 반드시 applyDelta()를 통해 변경해야 합니다.
 */

import { WorldSnapshot, WorldDelta } from "./entities.js";

/**
 * 인메모리 월드 상태 클래스
 *
 * DDD의 Aggregate Root 역할을 수행합니다.
 * 모든 게임 상태 변경은 이 클래스를 통해 이루어집니다.
 *
 * @example
 * ```typescript
 * // 초기화
 * const worldState = new WorldState(initialSnapshot);
 *
 * // 커맨드 실행 후 델타 적용
 * const delta = command.run(rng, worldState.getSnapshot(), actorId, args);
 * worldState.applyDelta(delta);
 *
 * // 현재 상태 조회
 * const currentSnapshot = worldState.getSnapshot();
 * ```
 */
export class WorldState {
  private state: WorldSnapshot;

  /**
   * @param initialState 초기 게임 상태
   */
  constructor(initialState: WorldSnapshot) {
    this.state = { ...initialState };
  }

  /**
   * 스냅샷으로부터 상태 복구
   *
   * DB에서 로드한 스냅샷으로 상태를 초기화할 때 사용합니다.
   * 깊은 복사를 수행하여 외부 참조를 차단합니다.
   */
  public restoreFromSnapshot(snapshot: WorldSnapshot): void {
    this.state = JSON.parse(JSON.stringify(snapshot));
  }

  /**
   * 현재 스냅샷 획득
   *
   * 깊은 복사본을 반환하여 외부에서 직접 수정을 방지합니다.
   * 커맨드 실행 시 이 스냅샷을 전달합니다.
   */
  public getSnapshot(): WorldSnapshot {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * 델타(Delta) 적용
   *
   * 커맨드나 이벤트가 반환한 델타를 현재 상태에 병합합니다.
   * 각 엔티티 타입별로 부분 업데이트를 수행합니다.
   *
   * @param delta 적용할 상태 변경 델타
   *
   * @example
   * ```typescript
   * // 장수의 골드와 병력 변경
   * worldState.applyDelta({
   *   generals: {
   *     [generalId]: { gold: 500, crew: 1000 }
   *   }
   * });
   * ```
   */
  public applyDelta(delta: WorldDelta): void {
    if (delta.generals) {
      for (const [id, gDelta] of Object.entries(delta.generals)) {
        const nid = Number(id);
        const current = this.state.generals[nid];
        if (current) {
          this.state.generals[nid] = { ...current, ...gDelta } as any;
        }
      }
    }

    if (delta.nations) {
      for (const [id, nDelta] of Object.entries(delta.nations)) {
        const nid = Number(id);
        const current = this.state.nations[nid];
        if (current) {
          this.state.nations[nid] = { ...current, ...nDelta } as any;
        }
      }
    }

    if (delta.cities) {
      for (const [id, cDelta] of Object.entries(delta.cities)) {
        const nid = Number(id);
        const current = this.state.cities[nid];
        if (current) {
          this.state.cities[nid] = { ...current, ...cDelta } as any;
        }
      }
    }

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

    if (delta.messages) {
      for (const message of delta.messages) {
        this.state.messages[message.id] = message;
      }
    }

    if (delta.gameTime) {
      this.state.gameTime = { ...this.state.gameTime, ...delta.gameTime };
    }
  }

  /**
   * 저널 재생 (Event Sourcing)
   *
   * 저널 엔트리를 순차적으로 적용하여 상태를 복원합니다.
   * 장애 복구나 특정 시점으로 롤백 시 사용됩니다.
   *
   * @param journal 저널 엔트리 (타입과 페이로드 포함)
   */
  public applyJournal(journal: { type: string; payload: any }): void {
    if (journal.type === "turn_run" && journal.payload.delta) {
      this.applyDelta(journal.payload.delta);
    }
    // TODO: 다른 저널 타입 처리 추가 (이벤트, 월간 처리 등)
  }
}
