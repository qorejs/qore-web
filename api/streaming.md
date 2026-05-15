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

Use `mapStream()` and `scanStream()` when you need to transform chunk streams before binding them to UI.
