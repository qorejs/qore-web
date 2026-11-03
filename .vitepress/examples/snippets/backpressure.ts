import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const paced = stream.withBackpressure(['1', '2', '3', '4', '5'], {
    interval,
    buffer: 2,
    overflow: 'wait',
  })
  return { stream: paced }
}
