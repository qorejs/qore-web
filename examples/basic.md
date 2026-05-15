# Basic Example

## Hello World

```ts
import { h, mount } from '@qorejs/qore'

mount('#app', () => h('h1', {}, 'Hello, Qore!'))
```

## Reactive Text

```ts
import { h, mount, signal, text } from '@qorejs/qore'

const name = signal('World')

mount('#app', () => h('main', {},
  h('input', { value: name(), oninput: event => name(event.target.value) }),
  h('p', {}, text(() => `Hello, ${name()}!`))
))
```
