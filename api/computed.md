# Computed API

`computed()` creates a readonly derived value.

```ts
import { computed, signal } from '@qorejs/qore'

const price = signal(100)
const quantity = signal(2)
const total = computed(() => price() * quantity())
```

## Signature

```ts
function computed<T>(getter: () => T): ReadonlySignal<T>
```

## Behavior

- Tracks signals read during `getter`
- Recomputes when dependencies change
- Caches the latest value
- Exposes readonly signal methods

```ts
total()      // 200
price(150)
total()      // 300
```

Use computed values for derived UI state, totals, filters, labels, and status summaries.
