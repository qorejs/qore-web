import { stream, sleep } from '@qorejs/qore'

export function createExample(interval = 160) {
  async function* source(delay: number, value: string) {
    await sleep(delay)
    yield value
  }
  const fastest = stream.race([
    source(interval * 3, 'Slow source.'),
    source(interval, 'Fast source wins.'),
  ])
  return { stream: fastest }
}
