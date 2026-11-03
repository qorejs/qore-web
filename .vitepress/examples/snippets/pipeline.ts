import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const result = stream.pipe(['draft'], [
    draft => [`\nreview(${draft})`],
    review => [`\nship(${review.trim()})`],
  ], { backpressure: { interval } })
  return { stream: result }
}
