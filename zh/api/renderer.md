# Renderer API

Qore 直接渲染到 DOM，不走虚拟 DOM diff。

## `h()`

```ts
function h(type, props?, ...children)
```

```ts
import { h } from '@qorejs/qore'

const view = h('main', {},
  h('h1', {}, 'Qore'),
  h('p', {}, 'Streaming response UI')
)
```

## `mount()`

```ts
import { mount } from '@qorejs/qore'

const dispose = mount('#app', () => view)

dispose()
```

## `text()`

```ts
import { h, signal, text } from '@qorejs/qore'

const name = signal('Qore')

h('p', {}, text(() => `Hello, ${name()}`))
```

`text()` 会创建细粒度文本绑定，只更新依赖它的 text node。
