# Effect API

`effect()` runs a side effect and tracks the signals it reads.

```ts
import { effect, signal } from '@qorejs/qore'

const count = signal(0)

const stop = effect(() => {
  console.log(count())
})
```

## Signature

```ts no-test
function effect(
  fn: () => void | (() => void),
  options?: EffectOptions
): () => void
```

## Cleanup

Return a cleanup function to dispose subscriptions, timers, or external resources.

```ts no-test
effect(() => {
  const unsubscribe = subscribe(userId())
  return () => unsubscribe()
})
```

The returned function stops the effect.

```ts
stop()
```
