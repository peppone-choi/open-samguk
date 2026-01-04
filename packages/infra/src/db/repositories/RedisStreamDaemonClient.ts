import { IDaemonClient } from '@sammo-ts/logic';
import { addToStream } from '../../redis/index.js';
import { env } from '../../env.js';

/**
 * Redis Streams 기반 데몬 클라이언트 (Adapter)
 */
export class RedisStreamDaemonClient implements IDaemonClient {
  private readonly streamKey: string;

  constructor() {
    this.streamKey = `stream:${env.PROFILE}:daemon:commands`;
  }

  async sendCommand(params: {
    type: string;
    requestId: string;
    payload: any;
  }): Promise<void> {
    await addToStream(this.streamKey, {
      type: params.type,
      requestId: params.requestId,
      payload: JSON.stringify({ 
        type: params.type, 
        requestId: params.requestId, 
        ...params.payload 
      }),
      timestamp: new Date().toISOString(),
    });
  }
}
