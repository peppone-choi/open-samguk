import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EngineService } from './engine.service.js';
import { JournalService } from './journal.service.js';

describe('EngineService', () => {
  let service: EngineService;
  let mockJournalService: any;
  let mockWorldService: any;
  let mockTurnRepository: any;

  beforeEach(async () => {
    mockJournalService = {
      record: vi.fn().mockResolvedValue(undefined),
    };

    mockWorldService = {
      getSnapshot: vi.fn().mockReturnValue({
        gameTime: { year: 184, month: 1 },
        generals: {},
      }),
      applyDelta: vi.fn(),
      saveSnapshot: vi.fn().mockResolvedValue(undefined),
    };

    mockTurnRepository = {
      getNextTurn: vi.fn().mockResolvedValue(null),
      consumeTurn: vi.fn().mockResolvedValue(undefined),
    };

    service = new EngineService(mockJournalService, mockWorldService, mockTurnRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have initial status idle', () => {
    expect(service.getStatus().state).toBe('idle');
  });

  it('should handle pause and resume', async () => {
    await service.handleCommand({ type: 'pause', requestId: '1' });
    expect(service.getStatus().state).toBe('paused');

    await service.handleCommand({ type: 'resume', requestId: '2' });
    expect(service.getStatus().state).toBe('idle');
  });

  it('should handle run', async () => {
    const result = await service.handleCommand({ type: 'run', reason: 'manual', requestId: '3' });
    expect(result.type).toBe('runCompleted');
    expect(service.getStatus().state).toBe('idle');
    expect(service.getStatus().metrics.totalProcessedTurns).toBe(1);
  });

  it('should fail run when paused', async () => {
    await service.handleCommand({ type: 'pause', requestId: '4' });
    const result = await service.handleCommand({ type: 'run', reason: 'manual', requestId: '5' });
    expect(result.type).toBe('runFailed');
    expect((result as any).error).toBe('Engine is paused');
  });
});
