# Streaming API

Qore 的核心 primitive 是 `stream()`：它返回一个 `QoreStream`，而 `QoreStream` 本身就是一个只读 signal。

```ts
import { h, stream, text } from '@qorejs/qore'

const answer = stream(openAI.chat('hello'))

export function App() {
  return h('div', {}, text(() => answer()))
}
```

当 chunk 到达时，`answer()` 的累积值会更新，依赖它的 text node 会被细粒度刷新。

## `stream(source, options)`

```ts
function stream<TChunk = unknown>(
  source: StreamInput<TChunk, string>,
  options?: StreamOptions<TChunk, string>
): QoreStream<TChunk, string>
```

`source` 可以是同步 iterable、异步 iterable，或者接收 controller 的 setup 函数。

```ts
const answer = stream(['Hello', ' ', 'Qore'])
answer() // "Hello Qore"
```

```ts
const answer = stream(async function* () {
  yield 'token one '
  yield 'token two'
})
```

```ts
const answer = stream(async (controller) => {
  await controller.push('first ')
  await controller.push('second')
  controller.done()
})
```

## `QoreStream`

`QoreStream<TChunk, TValue>` extends `ReadonlySignal<TValue>` and `AsyncIterable<TChunk>`.

```ts
const answer = stream(['a', 'b'])

answer()              // current accumulated value
answer.status()       // pending | streaming | completed | error | aborted
answer.chunkCount()   // number of chunks received
answer.ready          // Promise<string>
answer.abort()        // stop the source
```

Runtime-owned fields are exposed as readonly signals:

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

### `stream.text()`

Explicit text accumulation.

```ts
const response = stream.text(modelStream)
```

### `stream.list()`

Accumulate every chunk into an array.

```ts
const events = stream.list([{ step: 1 }, { step: 2 }])
events() // [{ step: 1 }, { step: 2 }]
```

### `stream.latest()`

Expose only the latest chunk.

```ts
const progress = stream.latest([10, 40, 100])
progress() // 100
```

### `stream.paced()`

Add a minimum interval between chunk commits.

```ts
const answer = stream.paced(openAI.chat('hello'), 24)
```

### `stream.withBackpressure()`

Control buffering when a source emits faster than the UI should consume.

```ts
const answer = stream.withBackpressure(source, {
  interval: 16,
  buffer: 128,
  overflow: 'drop-oldest'
})
```

## Custom Reduction

Use `stream.create()` when the current value is not plain text.

```ts
const totals = stream.create<number, number>([1, 2, 3], {
  seed: 0,
  reduce: (total, chunk) => total + chunk
})

totals() // 6
```

## Mapping and Scanning

```ts
import { mapStream, scanStream } from '@qorejs/qore'

const words = mapStream(tokens, token => token.toUpperCase())

const running = scanStream(
  [1, 2, 3],
  (total, chunk) => total + chunk,
  0
)
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

const sse = createSSEAdapter({ endpoint: '/api/events' })
const answer = stream(sse.stream({ prompt: 'hello' }))
```

## Async Iteration

The same response can drive the UI and external consumers.

```ts
const answer = stream(openAI.chat('hello'))

for await (const chunk of answer) {
  console.log('chunk', chunk)
}
```

## UI Rendering

```ts
import { h, mount, stream, text } from '@qorejs/qore'

const answer = stream(openAI.chat('hello'))

mount('#app', () => h('main', {},
  h('p', {}, text(() => answer())),
  h('small', {}, text(() => answer.status()))
))
```

[阅读流式响应指南](/guide/streaming)
