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

显式使用文本累积。

```ts
const response = stream.text(modelStream)
```

### `stream.list()`

把每个 chunk 累积进数组。

```ts
const events = stream.list([{ step: 1 }, { step: 2 }])
events() // [{ step: 1 }, { step: 2 }]
```

### `stream.latest()`

只暴露最新的 chunk。

```ts
const progress = stream.latest([10, 40, 100])
progress() // 100
```

### `stream.paced()`

给 chunk commit 增加最小间隔。

```ts
const answer = stream.paced(openAI.chat('hello'), 24)
```

### `stream.withBackpressure()`

当 source 发得比 UI 应该消费的速度更快时，用它控制缓冲区。

```ts
const answer = stream.withBackpressure(source, {
  interval: 16,
  buffer: 128,
  overflow: 'drop-oldest'
})
```

## Custom Reduction

当当前值不是普通文本时，用 `stream.create()`。

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

Qore 提供 provider helper，把 OpenAI、Anthropic 或通用 SSE 都变成 async iterable stream，所以 UI API 保持一致。

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

同一个 response 可以同时驱动 UI 和外部消费者。

```ts
const answer = stream(openAI.chat('hello'))

for await (const chunk of answer) {
  console.log('chunk', chunk)
}
```

[阅读流式响应指南](/zh/guide/streaming)
