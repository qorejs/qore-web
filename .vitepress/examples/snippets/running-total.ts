import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const total = stream.create([10, 15, 17], {
    seed: 0,
    reduce: (sum, value) => sum + value,
    backpressure: { interval },
  })
  return { stream: total }
}
