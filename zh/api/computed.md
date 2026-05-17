# Computed API

`computed()` 创建只读派生值。

```ts
import { computed, signal } from '@qorejs/qore'

const price = signal(100)
const quantity = signal(2)
const total = computed(() => price() * quantity())
```

## 签名

```ts
function computed<T>(getter: () => T): ReadonlySignal<T>
```

## 行为

- 自动追踪 `getter` 中读取的 signal
- 依赖变化时重新计算
- 缓存最新值
- 暴露只读 signal 方法

```ts
console.log(total()) // 200
price(150)
console.log(total()) // 300
```

适合用于派生 UI 状态、总价、过滤结果、标签和状态摘要。
