import { stream, sleep } from '@qorejs/qore'

export function createExample(interval = 160) {
  const answer = stream(async controller => {
    await controller.push('Partial response. ')
    await sleep(interval * 2, controller.signal)
    throw new Error('Demo connection lost')
  })
  // Observe answer.error(); handle answer.ready rejection.
  return { stream: answer }
}
