# Signal API

Signal 是可调用的响应式值。

```ts
import { signal } from '@qorejs/qore'

const count = signal(0)

count()   // read
count(1)  // write
```

## 签名

```ts
function signal<T>(initialValue: T): Signal<T>
```

## 方法

| API | 说明 |
| --- | --- |
| `signal()` | 读取当前值，并建立依赖 |
| `signal(value)` | 写入新值 |
| `signal.set(value)` | 写入新值 |
| `signal.update(fn)` | 基于旧值更新 |
| `signal.peek()` | 无依赖追踪读取 |
| `signal.subscribe(fn)` | 手动订阅变化 |

## 示例

```ts no-test
import { h, mount, signal, text } from '@qorejs/qore'

const count = signal(0)

mount('#app', () => h('button', {
  onclick: () => count.update(n => n + 1)
}, text(() => `Count: ${count()}`)))
```
