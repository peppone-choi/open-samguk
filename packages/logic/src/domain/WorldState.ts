import { WorldSnapshot, WorldDelta } from './entities.js';

/**
 * 인메모리 월드 상태 (Domain Model)
 * DDD: 엔진의 단일 권위 상태(Source of Truth)를 관리하며, 상태 변이 로직을 포함함
 */
export class WorldState {
  private state: WorldSnapshot;

  constructor(initialState: WorldSnapshot) {
    this.state = { ...initialState };
  }

  /**
   * 스냅샷으로부터 상태 복구
   */
  public restoreFromSnapshot(snapshot: WorldSnapshot): void {
    this.state = JSON.parse(JSON.stringify(snapshot));
  }

  /**
   * 스냅샷 획득
   */
  public getSnapshot(): WorldSnapshot {
    // 깊은 복사 (간단하게 구현)
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * 델타(Delta) 적용
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

    if (delta.gameTime) {
      this.state.gameTime = { ...this.state.gameTime, ...delta.gameTime };
    }
  }

  /**
   * 저널 재생 (Replay)
   */
  public applyJournal(journal: { type: string; payload: any }): void {
    // 저널 타입에 따른 처리
    if (journal.type === 'turn_run' && journal.payload.delta) {
      this.applyDelta(journal.payload.delta);
    }
    // TODO: 다른 저널 타입(이벤트 등) 처리 추가
  }
}
