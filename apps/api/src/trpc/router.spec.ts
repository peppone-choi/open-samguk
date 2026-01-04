import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from './router.js';

// Infra 모듈 모킹
vi.mock('@sammo-ts/infra', () => ({
  addToStream: vi.fn().mockResolvedValue('123-0'),
  env: { PROFILE: 'test' },
}));

import { addToStream } from '@sammo-ts/infra';

describe('tRPC Router', () => {
  let mockEngineService: any;
  let mockDaemonClient: any;
  let caller: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEngineService = {
      getStatus: () => 'idle',
    };
    mockDaemonClient = {
      sendCommand: vi.fn().mockResolvedValue(undefined),
    };

    caller = appRouter.createCaller({
      engineService: mockEngineService,
      daemonClient: mockDaemonClient,
    });
  });

  it('should get health status', async () => {
    const health = await caller.health();
    expect(health.status).toBe('ok');
  });

  it('should push run command via daemonClient', async () => {
    const result = await caller.run({ reason: 'manual' });
    expect(result.type).toBe('accepted');
    expect(mockDaemonClient.sendCommand).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'run' })
    );
  });
});
