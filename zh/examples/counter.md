# Counter Example

```ts
import { computed, h, mount, signal, text } from '@qorejs/qore'

const count = signal(0)
const double = computed(() => count() * 2)

mount('#app', () => h('main', {},
  h('h1', {}, 'Counter'),
  h('p', {}, text(() => `Count: ${count()}`)),
  h('p', {}, text(() => `Double: ${double()}`)),
  h('button', { onclick: () => count(count() - 1) }, '-1'),
  h('button', { onclick: () => count(count() + 1) }, '+1'),
  h('button', { onclick: () => count(0) }, 'Reset')
))
```
