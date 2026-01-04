import { WorldSnapshot, WorldDelta } from '../domain/entities.js';
import { RandUtil } from '@sammo-ts/common';

/**
 * 트리거 컨텍스트
 */
export interface TriggerContext {
  actorId: number;
  snapshot: WorldSnapshot;
  rand: RandUtil;
}

/**
 * 트리거 인터페이스 (DDD)
 * attempt: 실행 가능 여부 및 확률 판정
 * execute: 실제 상태 변경(Delta) 생성
 */
export interface Trigger {
  readonly name: string;
  readonly priority: number;

  attempt(ctx: TriggerContext): boolean;
  execute(ctx: TriggerContext): WorldDelta;
}

/**
 * 트리거 레지스트리
 * 우선순위에 따라 트리거를 관리하고 실행함
 */
export class TriggerRegistry {
  private triggers: Trigger[] = [];

  public register(trigger: Trigger): void {
    this.triggers.push(trigger);
    this.triggers.sort((a, b) => a.priority - b.priority);
  }

  public runAll(ctx: TriggerContext): WorldDelta[] {
    const deltas: WorldDelta[] = [];
    for (const trigger of this.triggers) {
      if (trigger.attempt(ctx)) {
        deltas.push(trigger.execute(ctx));
      }
    }
    return deltas;
  }
}
