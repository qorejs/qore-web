# Signal API

Signals are callable reactive values.

```ts
import { signal } from '@qorejs/qore'

const count = signal(0)

count()   // read
count(1)  // write
```

## Signature

```ts
function signal<T>(initialValue: T): Signal<T>
```

## Methods

| API | Description |
| --- | --- |
| `signal()` | Read the current value and track dependency |
| `signal(value)` | Set a new value |
| `signal.set(value)` | Set a new value |
| `signal.update(fn)` | Update from the previous value |
| `signal.peek()` | Read without tracking |
| `signal.subscribe(fn)` | Observe changes manually |

## Example

```ts no-test
import { h, mount, signal, text } from '@qorejs/qore'

const count = signal(0)

mount('#app', () => h('button', {
  onclick: () => count.update(n => n + 1)
}, text(() => `Count: ${count()}`)))
```
