import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const text = stream.paced([
    '{"title":"Qore",', '"items":["stream",', '"signal"]}',
  ], interval)
  const parsed = stream.latest(async function* () {
    const complete = await text.ready
    yield JSON.parse(complete)
  }())
  return { stream: parsed, dispose: () => text.abort() }
}
