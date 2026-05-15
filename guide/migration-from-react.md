---
title: Migrating from React
description: Map React state and effects to Qore signals, effects, and streams.
keywords: [Qore, React, migration, useState, useEffect, signal]
---

# Migrating from React

Qore removes the component rerender loop from the hot path of streaming UI.

## Concept Map

| React | Qore | Notes |
| --- | --- | --- |
| `useState` | `signal` | Callable reactive value |
| `useMemo` | `computed` | Cached derived value |
| `useEffect` | `effect` | Dependency-tracked side effect |
| Stream reader loop | `stream()` | Async stream + readonly signal |
| Component rerender | Text node update | Fine-grained DOM binding |

## State

```tsx
const [count, setCount] = useState(0)
```

```ts
const count = signal(0)
count(count() + 1)
```

## Text Binding

```tsx
return <p>{count}</p>
```

```ts
return h('p', {}, text(() => count()))
```

## Streaming

React apps usually read tokens and append them into state:

```tsx
for await (const token of aiStream) {
  setText(prev => prev + token)
}
```

Qore turns the stream into the state source:

```ts
const text = stream(aiStream)
return h('p', {}, text(() => text()))
```

## Migration Strategy

1. Move high-frequency state to signals.
2. Replace token append loops with `stream()`.
3. Bind streaming output through `text(() => response())`.
4. Keep React where you still need a broad ecosystem; use Qore where streaming response is the bottleneck.
