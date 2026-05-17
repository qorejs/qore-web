# Component API

Qore 的组件就是返回 DOM 描述的普通函数。

```ts
import { h } from '@qorejs/qore'

const Hello = ({ name }: { name: string }) => h('h1', {}, `Hello, ${name}`)
```

## 响应式组件

```ts
import { h, signal, text } from '@qorejs/qore'

const Counter = () => {
  const count = signal(0)

  return h('section', {},
    h('button', { onclick: () => count.update(n => n + 1) }, 'Increment'),
    h('p', {}, text(() => count()))
  )
}
```

组件只负责组合视图；真正变化的部分交给 signal 和 stream。
