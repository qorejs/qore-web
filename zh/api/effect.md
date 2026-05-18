# Effect API

`effect()` 会运行副作用，并自动追踪它读取的 signal。

```ts
import { effect, signal } from '@qorejs/qore'

const count = signal(0)

const stop = effect(() => {
  console.log(count())
})
```

## 签名

```ts no-test
function effect(
  fn: () => void | (() => void),
  options?: EffectOptions
): () => void
```

## 清理

返回 cleanup 函数可以释放订阅、定时器或外部资源。

```ts no-test
effect(() => {
  const unsubscribe = subscribe(userId())
  return () => unsubscribe()
})
```

`effect()` 的返回值可以停止该副作用。

```ts
stop()
```
