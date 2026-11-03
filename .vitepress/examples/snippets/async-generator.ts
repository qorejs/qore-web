import { stream, sleep } from '@qorejs/qore'

export function createExample(interval = 160) {
  async function* steps() {
    yield 'Plan'
    await sleep(interval)
    yield ' → Build'
    await sleep(interval)
    yield ' → Ship'
  }
  return { stream: stream(steps()) }
}
