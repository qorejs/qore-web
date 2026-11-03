import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const progress = stream.latest([0, 25, 50, 75, 100], {
    backpressure: { interval },
  })
  return { stream: progress }
}
