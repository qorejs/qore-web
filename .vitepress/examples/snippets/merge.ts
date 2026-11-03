import { stream, sleep } from '@qorejs/qore'

export function createExample(interval = 160) {
  async function* source(label: string, offset: number) {
    await sleep(offset)
    yield `${label}1 `
    await sleep(interval * 2)
    yield `${label}2 `
  }
  const merged = stream.merge([source('A', 0), source('B', interval)])
  return { stream: merged }
}
