import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const answer = stream.paced(['Hello, ', 'streaming ', 'world.'], interval)
  return { stream: answer }
}
