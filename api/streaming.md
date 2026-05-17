# Streaming API

`stream()` is Qore's core primitive. It returns a `QoreStream`, and a `QoreStream` is a readonly signal.

```ts
import { h, stream, text } from '@qorejs/qore'

const answer = stream(openAI.chat('hello'))

export function App() {
  return h('div', {}, text(() => answer()))
}
```

When chunks arrive, `answer()` updates and dependent DOM nodes refresh.

## `stream(source, options)`

```ts
function stream<TChunk = unknown>(
  source: StreamInput<TChunk, string>,
  options?: StreamOptions<TChunk, string>
): QoreStream<TChunk, string>
```

`source` can be a sync iterable, async iterable, or controller setup function.

```ts
stream(['Hello', ' ', 'Qore'])
```

```ts
stream(async function* () {
  yield 'token one '
  yield 'token two'
})
```

```ts
stream(async controller => {
  await controller.push('first ')
  await controller.push('second')
  controller.done()
})
```

## `QoreStream`

```ts
const answer = stream(['a', 'b'])

answer()              // current accumulated value
answer.status()       // pending | streaming | completed | error | aborted
answer.chunkCount()   // chunks received
answer.ready          // Promise<string>
answer.abort()        // stop source
```

Runtime state is exposed as readonly signals:

```ts
answer.status()
answer.error()
answer.chunks()
answer.startedAt()
answer.finishedAt()
answer.buffered()
answer.dropped()
```

## Helpers

```ts
stream.text(source)
stream.list(source)
stream.latest(source)
stream.paced(source, 24)
```

Use `stream.create()` when the current value is not plain text:

```ts
const totals = stream.create<number, number>([1, 2, 3], {
  seed: 0,
  reduce: (total, chunk) => total + chunk
})

totals() // 6
```

Use `stream.withBackpressure()` when a source can emit faster than the UI should commit chunks:

```ts
const answer = stream.withBackpressure(source, {
  interval: 16,
  buffer: 128,
  overflow: 'drop-oldest'
})
```

Use `mapStream()` and `scanStream()` when you need to transform chunk streams before binding them to UI.

```ts
import { mapStream, scanStream } from '@qorejs/qore'

const words = mapStream(tokens, token => token.toUpperCase())
const running = scanStream([1, 2, 3], (total, chunk) => total + chunk, 0)
```

## Provider Adapters

Qore ships provider helpers that produce async iterable streams, so the UI API stays the same.

```ts
import { createOpenAI, h, stream, text } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const answer = stream(openAI.chat('Explain signals in one sentence.'))

export const App = () => h('article', {}, text(() => answer()))
```

```ts
import { createAnthropic, stream } from '@qorejs/qore'

const anthropic = createAnthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY })
const answer = stream(anthropic.chat('Explain streaming UI.'))
```

```ts
import { createSSEAdapter, stream } from '@qorejs/qore'

const sse = createSSEAdapter<{ prompt: string }>({
  url: '/api/events',
  headers: { 'Content-Type': 'application/json' },
  buildRequest(request) {
    return { body: JSON.stringify(request) }
  },
  eventToText(event) {
    return typeof event.data === 'string' ? event.data : undefined
  }
})

const answer = stream(sse.streamText({ prompt: 'hello' }))
```

## Async Iteration

The same response can drive the UI and external consumers.

```ts
const answer = stream(openAI.chat('hello'))

for await (const chunk of answer) {
  console.log('chunk', chunk)
}
```
