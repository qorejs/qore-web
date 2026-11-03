import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const tasks = stream.list(['Search', 'Read', 'Answer'], {
    backpressure: { interval },
  })
  return { stream: tasks }
}
