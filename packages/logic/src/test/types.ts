import { WorldSnapshot, WorldDelta } from '../domain/entities.js';

export interface ParityInput {
  snapshot: WorldSnapshot;
  seed: string;
  command?: {
    type: string;
    arg: Record<string, any>;
    actorId: number;
  };
}

export interface ParityOutput {
  delta: WorldDelta;
  logs: string[];
  metrics?: Record<string, number>;
}

export interface ParityCase {
  name: string;
  input: ParityInput;
  expected: ParityOutput;
}
