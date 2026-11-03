import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const stages = stream.concat([
    ['Plan. '], ['Build. '], ['Ship.'],
  ], { backpressure: { interval } })
  return { stream: stages }
}
