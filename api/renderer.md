# Renderer API

Qore renders directly to the DOM without a virtual DOM diff.

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
import { signal, text } from '@qorejs/qore'

const name = signal('Qore')

h('p', {}, text(() => `Hello, ${name()}`))
```

`text()` creates a fine-grained text binding.
