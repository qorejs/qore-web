---
title: Migrating from Vue
description: Map Vue refs and watchers to Qore signals, effects, and streams.
keywords: [Qore, Vue, migration, ref, watch, signal]
---

# Migrating from Vue

Vue's Composition API and Qore signals share a similar mental model: reactive values are explicit.

## Concept Map

| Vue | Qore | Notes |
| --- | --- | --- |
| `ref()` | `signal()` | Callable read/write value |
| `computed()` | `computed()` | Derived value |
| `watchEffect()` | `effect()` | Auto-tracked effect |
| Template interpolation | `text(() => value())` | Fine-grained text binding |
| Stream reader loop | `stream()` | Async stream + readonly signal |

## Ref to Signal

```ts
const count = ref(0)
count.value++
```

```ts
const count = signal(0)
count(count() + 1)
```

## Computed

```ts
const double = computed(() => count() * 2)
```

## Streaming

```ts
const answer = stream(provider.chat(messages))

return h('article', {}, text(() => answer()))
```

## Migration Strategy

1. Replace local `ref` state with `signal` where Qore owns the DOM.
2. Keep derived values as `computed`.
3. Use `stream()` for model output, logs, SSE, and progress feeds.
4. Keep Vue components for existing screens while extracting streaming-heavy widgets into Qore.
