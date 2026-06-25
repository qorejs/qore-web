# React Adapter

Qore is a stream runtime first. The React adapter lets existing React apps subscribe to Qore streams without making every token a component-state update.

> Status: release-ready adapter in the Qore repository. The package is prepared as `@qorejs/react`; npm publishing is waiting on scope access.

## Mental Model

```text
Provider / AsyncIterable
  -> QoreStream
  -> React external store
  -> Component view
```

React remains the view layer. Qore owns the streaming state, lifecycle, abort, chunks, and readonly snapshots.

## Hook Shape

```tsx
import { stream } from '@qorejs/qore'
import { useQoreStream } from '@qorejs/react'

export function Answer({ prompt }: { prompt: string }) {
  const answer = useQoreStream(
    () => stream(fetch(`/api/chat?prompt=${encodeURIComponent(prompt)}`).then((response) => response.body)),
    [prompt],
    { initialValue: '' }
  )

  return (
    <article>
      <p>{answer.value}</p>
      <small>{answer.status}</small>
      <button onClick={() => answer.abort()}>Stop</button>
    </article>
  )
}
```

`useQoreStream` starts after mount, subscribes with `useSyncExternalStore`, and aborts the previous stream when dependencies change or the component unmounts. Pass `{ enabled: false }` to keep an idle snapshot without starting network work.

## Selector Hook

If a component only needs one slice of stream state, use `useQoreSignalSelector` so React subscribes to the value that component actually reads.

```tsx
import type { QoreStream } from '@qorejs/qore'
import { useQoreSignalSelector } from '@qorejs/react'

export function TokenCounter({ answer }: { answer: QoreStream<string, string> }) {
  const tokenCount = useQoreSignalSelector(answer.chunks, (chunks) => chunks.length)
  return <span>{tokenCount}</span>
}
```

## What You Get

- `value`: the current stream signal value.
- `status`: `idle`, `streaming`, `completed`, `failed`, or `aborted`.
- `error`: the current stream error.
- `chunks`: defensive chunk history snapshots.
- `streaming`, `completed`, `failed`, `aborted`: derived lifecycle booleans.
- `chunkCount`, `buffered`, `dropped`: runtime counters.
- `abort()`: cancel the active stream.

## Safety Boundary

Do not put provider secrets in browser React code. Expose your own SSE or NDJSON endpoint from the server, then stream that endpoint into Qore.
