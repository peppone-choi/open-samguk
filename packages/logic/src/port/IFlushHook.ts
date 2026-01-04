import { WorldDelta } from '../domain/entities.js';

/**
 * 플러시 훅 인터페이스 (Port)
 * DDD: 엔진이 턴 처리 결과를 외부(DB 등)로 내보낼 때 사용함
 */
export interface IFlushHook {
  flush(delta: WorldDelta): Promise<void>;
}
