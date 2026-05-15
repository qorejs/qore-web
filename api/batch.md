# Batch API

`batch()` groups multiple signal writes so dependents see one settled update.

```ts
import { batch, computed, signal } from '@qorejs/qore'

const firstName = signal('Ada')
const lastName = signal('Lovelace')
const fullName = computed(() => `${firstName()} ${lastName()}`)

batch(() => {
  firstName('Grace')
  lastName('Hopper')
})

fullName() // Grace Hopper
```

## Signature

```ts
function batch<T>(fn: () => T): T
```

Use batching when several writes describe one logical state transition.
