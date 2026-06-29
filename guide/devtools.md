# DevTools Hook

Qore exposes a tiny development hook for stream inspection. It is inert by default. For most apps, start with the built-in stream inspector instead of wiring the global hook by hand.

## Stream Inspector

```ts
import { createStreamInspector, stream } from '@qorejs/qore'

const inspector = createStreamInspector({
  maxEvents: 200,
})

const answer = stream(model.chat('hello'), { name: 'answer' })
const trace = inspector.stream('answer')
await answer.ready

console.table(inspector.streams())
console.log(trace()?.firstChunkLatencyMs, trace()?.chunksPerSecond)

inspector.dispose()
```

`inspector.events()` is a readonly signal for recent raw lifecycle events. `inspector.streams()` is a readonly signal that summarizes each stream by `id`, `name`, `status`, `chunkCount`, timestamps, latest value, and runtime metrics.

The summary includes:

- `firstChunkLatencyMs`: time from stream creation to first chunk
- `durationMs`: time from stream creation to terminal state, or latest update while active
- `chunksPerSecond`: observed chunk throughput
- `terminal`: whether the stream completed, errored, or aborted

Use `inspector.stream(idOrName)` when a panel only needs one stream:

```ts
const answerTrace = inspector.stream('answer')

answerTrace.subscribe((summary) => {
  console.log(summary?.status, summary?.durationMs)
})
```

Use metadata-only capture when you want timing without retaining token payloads:

```ts
const inspector = createStreamInspector({
  maxEvents: 500,
  capturePayloads: false,
})
```

## Raw Hook

When you install `globalThis.__QORE_DEVTOOLS__`, every named stream can emit lifecycle and chunk events.

```ts
globalThis.__QORE_DEVTOOLS__ = {
  events: [],
  emit(event) {
    console.log(event.phase, event.name, event.status)
  },
}

const answer = stream(model.chat('hello'), { name: 'answer' })
```

Events include `create`, `status`, `chunk`, `complete`, `error`, and `abort`.

```ts
const events = stream.events(agent.run(task), { name: 'agent-events' })
const markdown = events.select('text', {
  name: 'agent-markdown',
  seed: '',
  reduce: (current, event) => current + event.text,
})
```

The hook is best-effort and never affects stream control flow. It is designed for browser extensions, local inspectors, tests, and custom debugging dashboards.
