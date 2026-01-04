import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StreamConsumerService } from './stream-consumer.service.js';

describe('StreamConsumerService (DLQ Logic)', () => {
  let service: any;
  let mockRedis: any;
  let mockEngine: any;

  beforeEach(() => {
    mockRedis = {
      xreadgroup: vi.fn(),
      xack: vi.fn(),
      xadd: vi.fn(),
      xgroup: vi.fn().mockResolvedValue(undefined),
    };
    mockEngine = {
      handleCommand: vi.fn(),
    };
    // Service를 수동으로 인스턴스화 (테스트용)
    service = new StreamConsumerService(mockEngine);
    (service as any).redis = mockRedis;
  });

  it('메시지 처리 실패 시 최대 재시도 횟수 내에서는 ACK하지 않아야 함', async () => {
    mockEngine.handleCommand.mockRejectedValue(new Error('Persistent Failure'));
    
    const fields = ['payload', JSON.stringify({ requestId: 'req1', type: 'run' })];
    // retry count가 1인 경우 (처음 실패)
    await (service as any).processMessage('123-0', fields, 1);

    expect(mockRedis.xack).not.toHaveBeenCalled();
    expect(mockRedis.xadd).not.toHaveBeenCalled();
  });

  it('재시도 횟수 초과 시 데드레터 스트림으로 이동시키고 ACK해야 함', async () => {
    mockEngine.handleCommand.mockRejectedValue(new Error('Fatal'));
    
    const fields = ['payload', JSON.stringify({ requestId: 'req2', type: 'run' })];
    // retry count가 6인 경우 (최대 5회 가정)
    await (service as any).processMessage('456-0', fields, 6);

    expect(mockRedis.xadd).toHaveBeenCalledWith(
      expect.stringContaining(':dead'),
      '*',
      'original_id',
      '456-0',
      'payload',
      expect.any(String),
      'error',
      expect.stringContaining('Fatal')
    );
    expect(mockRedis.xack).toHaveBeenCalled();
  });
});
