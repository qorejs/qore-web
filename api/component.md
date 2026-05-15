# Component API

Qore components are plain functions that return DOM descriptions.

```ts
import { h } from '@qorejs/qore'

const Hello = ({ name }: { name: string }) => h('h1', {}, `Hello, ${name}`)
```

## Reactive Component

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

Components should be small composition units. Signals and streams own the reactive parts.
