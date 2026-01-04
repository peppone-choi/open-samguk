export interface TurnMetrics {
  lastTurnDurationMs: number;
  queueDepth: number;
  totalProcessedTurns: number;
}

export interface TurnDaemonStatus {
  state: 'idle' | 'running' | 'paused' | 'error';
  metrics: TurnMetrics;
}

export type RunReason = 'schedule' | 'manual' | 'poke';

export interface DaemonCommand {
  type: 'run' | 'pause' | 'resume' | 'getStatus';
  reason?: RunReason;
  requestId: string;
}

export interface DaemonEvent {
  type: 'status' | 'runStarted' | 'runCompleted' | 'runFailed';
  status?: TurnDaemonStatus;
  requestId?: string;
  error?: string;
}