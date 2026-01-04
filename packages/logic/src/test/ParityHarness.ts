import { ParityInput, ParityOutput } from './types.js';

export function normalizeParityOutput(output: ParityOutput): ParityOutput {
  const normalizedDelta = { ...output.delta };

  if (normalizedDelta.generals) {
    normalizedDelta.generals = sortObjectKeys(normalizedDelta.generals);
  }
  if (normalizedDelta.nations) {
    normalizedDelta.nations = sortObjectKeys(normalizedDelta.nations);
  }
  if (normalizedDelta.cities) {
    normalizedDelta.cities = sortObjectKeys(normalizedDelta.cities);
  }

  return {
    delta: normalizedDelta,
    logs: [...output.logs].sort(),
    metrics: output.metrics ? sortObjectKeys(output.metrics) : undefined,
  };
}

function sortObjectKeys<T extends object>(obj: T): T {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      (acc as any)[key] = (obj as any)[key];
      return acc;
    }, {} as T);
}
