import { stream, sleep } from '@qorejs/qore'

export function createExample(interval = 160) {
  const answer = stream(async controller => {
    await controller.push('Kept partial output.')
    await sleep(interval * 3, controller.signal)
    controller.abort('Cancelled by the demo')
  })
  return { stream: answer }
}
