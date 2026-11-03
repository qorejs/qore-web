import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const source = Promise.resolve('Resolved, then streamed.')
  return { stream: stream.paced(source, interval) }
}
