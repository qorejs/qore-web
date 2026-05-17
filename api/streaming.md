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

Qore ships provider helpers that produce async iterable streams, so the UI API stays the same. Run vendor adapters in a trusted runtime because provider keys must not ship to the browser.

```ts
import { createOpenAI, stream } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
const answer = stream(openAI.chat('Explain signals in one sentence.'))
```

```ts
import { createAnthropic, stream } from '@qorejs/qore'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const answer = stream(anthropic.chat('Explain streaming UI.'))
```

Browser apps should consume your own `/api/chat` proxy with the generic SSE adapter:

```ts
import { createSSEAdapter, h, stream, text } from '@qorejs/qore'

const chat = createSSEAdapter<{ prompt: string }, string, { text?: string }>({
  url: '/api/chat',
  headers: { 'Content-Type': 'application/json' },
  buildRequest(request) {
    return { body: JSON.stringify(request) }
  },
  buildChatRequest(prompt) {
    return { prompt }
  },
  eventToText(event) {
    return event.data.text
  }
})

const answer = stream(chat.chat('hello'))
export const App = () => h('article', {}, text(() => answer()))
```

## Async Iteration

The same response can drive the UI and external consumers.

```ts
const answer = stream(openAI.chat('hello'))

for await (const chunk of answer) {
  console.log('chunk', chunk)
}
```
