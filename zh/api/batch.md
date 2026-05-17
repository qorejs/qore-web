# Batch API

`batch()` 会把多次 signal 写入合并成一次稳定更新，让依赖方只看到最终状态。

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

## 签名

```ts
function batch<T>(fn: () => T): T
```

当几次写入属于同一个逻辑状态转换时，使用 `batch()`。
