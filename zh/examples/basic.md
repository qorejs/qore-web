# 基础示例

## Hello World

```ts
import { h, mount } from '@qorejs/qore'

mount('#app', () => h('h1', {}, 'Hello, Qore!'))
```

## 响应式文本

```ts
import { h, mount, signal, text } from '@qorejs/qore'

const name = signal('World')

mount('#app', () => h('main', {},
  h('input', {
    value: name(),
    oninput: (event: Event) => name((event.currentTarget as HTMLInputElement).value)
  }),
  h('p', {}, text(() => `Hello, ${name()}!`))
))
```
