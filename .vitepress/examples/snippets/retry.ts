import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const answer = stream.retryable(attempt => {
    if (attempt < 2) throw new Error('Temporary failure')
    return ['Recovered on attempt 3.']
  }, { maxRetries: 2, backoff: interval })
  return { stream: answer }
}
