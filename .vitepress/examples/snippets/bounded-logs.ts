import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const logs = stream.create(['log 1', 'log 2', 'log 3', 'log 4', 'log 5', 'log 6'], {
    seed: [] as string[],
    reduce: (window, line) => [...window, line].slice(-3),
    backpressure: { interval },
  })
  // This bounds the signal value, not the runtime's chunk history.
  return { stream: logs }
}
