import { stream, sleep } from '@qorejs/qore'

export function createExample(interval = 160) {
  async function* queries() {
    yield 'qo'
    await sleep(interval)
    yield 'qore'
  }
  async function* search(query: string) {
    await sleep(interval * 2)
    yield `Result: ${query}`
  }
  return { stream: stream.switchMap(queries(), query => search(query)) }
}
